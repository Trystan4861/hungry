<template>
  <div class="my-magic-input d-inline-flex w-100">
    <div
      class="magic-input-field"
      ref="inputFieldRef"
      @click="handleFieldClick"
      :style="props.style"
      :class="[props.class, { 'keyboard-active': showKeyboard }]"
      :id="inputID"
    >
      <span v-if="!inputValue" class="placeholder" @click="handlePlaceholderClick($event)">
        {{ props.placeholder }}
        <span v-if="showCaret" class="caret"></span>
      </span>
      <span v-else class="input-text" @click="handleTextClick($event)" v-html="textWithCaret"></span>
    </div>
    <span class="cross" @click="handleCrossClick" v-show="showCross || showEmpty">
      {{ (showCross && showEmpty) ? (inputValue != '' ? crossEmptyText : crossCloseText) : (showCross ? crossCloseText : crossEmptyText) }}
    </span>
    <div v-if="showKeyboard" class="virtual-keyboard-container">
      <div class="keyboard-close-container">
        <span class="keyboard-close" @click.stop="closeKeyboard" @touchend.stop="closeKeyboard">✖</span>
      </div>

      <div v-if="activeTab === 'keyboard'" class="keyboard-layout">
        <div
          v-for="(row, rowIndex) in keyboardLayout.rows"
          :key="rowIndex"
          class="keyboard-row"
          :id="row.id"
          :data-position="row.position || 'end'"
        >
          <template v-for="(key, keyIndex) in row.keys" :key="`${rowIndex}-${keyIndex}`">
            <MyKey
                :keyData="{
                ...key,
                type: 'type' in key ? key.type as 'symbol' | 'shift' | 'normal' | 'punctuation' | 'backspace' | 'special' | 'emoji' | 'space' | 'enter' | 'letters' | undefined : undefined,
                position: ('position' in key ? key.position : undefined) as 'center' | 'end' | 'start' | undefined
                }"
              :shiftActive="shiftActive"
              :shiftLocked="shiftLocked"
              @mousedown="handleKeyMouseDown"
              @mouseup="handleKeyMouseUp"
              @mouseenter="handleKeyMouseEnter"
              @mouseleave="handleKeyMouseLeave"
              @keypress="handleKeyPress"
            />
          </template>
        </div>

      </div>

      <div v-if="activeTab === 'emojis'" class="emoji-panel">
        <div class="emoji-panel-header">
          <div class="emoji-categories">
            <div
              v-for="(category, index) in emojiCategories"
              :key="index"
              class="emoji-category"
              :class="{ active: activeEmojiCategory === index }"
              @click.stop="activeEmojiCategory = index"
              @touchend.stop="activeEmojiCategory = index"
            >
              {{ category.icon }}
            </div>
          </div>
          <div class="keyboard-toggle-btn" @click.stop="activeTab = 'keyboard'" @touchend.stop="activeTab = 'keyboard'">
            ABC
          </div>
        </div>
        <div class="emoji-grid">
          <MyKey
            v-for="emoji in emojiCategories[activeEmojiCategory].emojis"
            :key="emoji"
            :keyData="{ main: emoji, type: 'normal' }"
            :shiftActive="false"
            :shiftLocked="false"
            class="emoji-item"
            @mouseup="handleKeyMouseUp"
            @keypress="handleKeyPress"
            @mouseenter="handleKeyMouseEnter"
            @mouseleave="handleKeyMouseLeave"
          />
        </div>
      </div>
    </div>

    <teleport to="body">
      <MyKeyLayer
        v-model:show="showSpecialKeysLayer"
        :special-keys="specialKeysOptions"
        :parent="currentKeyElement || undefined"
        @select="selectSpecialKey"
        @mouseleave="handleSpecialKeysLayerLeave"
      />
    </teleport>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
  import type { PropType } from 'vue';
  import { generateID } from '~/utils';
  import { myStore } from '~/composables/useStore';
  import '~/css/components/MyMagicInput.css';
  import MyKey from '~/components/MyKey.vue';
  import MyKeyLayer from './MyKeyLayer.vue';
  import type { KeyData,  KeyboardLayout } from '@/types';
  import Graphemer from 'graphemer';

  // Importar layouts
  import qwertyLayout from '~/assets/osk/qwerty.layout.json';
  import numericLayout from '~/assets/osk/numeric.layout.json';
  import punctuationLayout from '~/assets/osk/punctuation.layout.json';
  import emojiLayoutData from '~/assets/osk/emoji.layout.json';

  const props = defineProps({
    modelValue:       { type: String,   default: ''                     },
    placeholder:      { type: String,   default: 'Añade elementos aquí' },
    autoFocus:        { type: Boolean,  default: false                  },
    maxLength:        { type: Number,   default: Infinity               },
    defaultMaxLength: { type: Boolean,  default: false                  },
    showCross:        { type: Boolean,  default: false                  },
    showEmpty:        { type: Boolean,  default: false                  },
    class:            { type: String,                                   },
    style:            { type: String,                                   },
    crossEmptyText:   { type: String,   default: '🗑'                   },
    crossCloseText:   { type: String,   default: '❌'                   },
    id:               { type: String,   default: null                   },
    customKeyboard:   { type: Object as PropType<KeyboardLayout>,   default: null },
    keyboardType:     { type: String,   default: 'qwerty'               }
  });

  const splitter = new Graphemer();

  const emit = defineEmits(['updateValue', 'keyPressed:enter', 'blur', 'click', 'crossClick']);
  const store = myStore();
  const inputValue = ref(props.modelValue);
  const id = generateID();
  const inputID = props.id ?? `magic-input-${id}`;
  const inputFieldRef = ref<HTMLElement | null>(null);
  const showKeyboard = ref(false);
  const activeTab = ref('keyboard');
  const shiftActive = ref(true); // Por defecto activado para comenzar con mayúscula
  const shiftLocked = ref(false);
  const activeEmojiCategory = ref(0);

  // Variables para el layer de teclas especiales
  const showSpecialKeysLayer = ref(false);
  const specialKeysOptions = ref<string[]>([]);
  const fingerLeftLayer = ref(false); // Indica si el dedo ha salido del layer
  const currentKeyElement = ref<HTMLElement | null>(null); // Referencia a la tecla actual sobre la que se hace longclick

  // Ya no necesitamos el computed property, usamos directamente las variables ref
  const longPressTimer = ref<number | null>(null);
  const currentSpecialKeyIndex = ref(-1);
  const currentKey = ref('');

  // Variables para el control del cursor (caret)
  const caretPosition = ref(0); // Posición del cursor en el texto
  const showCaret = ref(false); // Controla la visibilidad del cursor
  const caretBlinkInterval = ref<number | null>(null); // Intervalo para el parpadeo del cursor

  const realMaxLenght = ref(props.maxLength);

  if (props.defaultMaxLength) realMaxLenght.value = store.maxLenght.value;

  // Usar el teclado personalizado si se proporciona, o el predeterminado si no
  const activeKeyboardLayout = ref('qwerty');

  const keyboardLayout = computed(() => {
    switch (activeKeyboardLayout.value) {
      case 'numeric':
        return numericLayout;
      case 'punctuation':
        return punctuationLayout;
      default:
        return qwertyLayout;
    }
  });

  // Usamos las interfaces KeyData, KeyboardRow y KeyboardLayout importadas desde types

  // Usar las categorías de emojis importadas
  const emojiCategories = emojiLayoutData.categories;

  /**
   * addChar - Añade un carácter al input teniendo en cuenta la tecla de mayúsculas
   * @param char - Carácter a añadir
   */
  const addChar = (char?: string) => {
    if (!char || inputValue.value.length >= realMaxLenght.value) return;

    let finalChar = char;

    // Si shift está activo o bloqueado y es una letra, convertir a mayúscula
    if ((shiftActive.value || shiftLocked.value) && finalChar.length === 1 && finalChar.match(/[a-zñ]/i)) {
      finalChar = finalChar.toUpperCase();
    }

    // Si shift está activo pero no bloqueado, desactivarlo después de usar
    if (shiftActive.value && !shiftLocked.value) {
      shiftActive.value = false;
    }

    // Insertar el carácter en la posición del cursor
    const textBefore = inputValue.value.substring(0, caretPosition.value);
    const textAfter = inputValue.value.substring(caretPosition.value);
    inputValue.value = textBefore + finalChar + textAfter;

    // Avanzar la posición del cursor
    caretPosition.value += finalChar.length;

    // Reactivar el cursor para evitar que desaparezca durante la escritura
    activateCaret(true);
  };

  /**
   * backspace - Borra el carácter a la izquierda del cursor
   * Maneja correctamente los emojis que son caracteres de 2 bytes
   */
   const backspace = () => {
  if (caretPosition.value > 0) {
    const textBefore = inputValue.value.substring(0, caretPosition.value);
    const textAfter = inputValue.value.substring(caretPosition.value);

    const graphemes = splitter.splitGraphemes(textBefore);
    graphemes.pop(); // borra el último carácter visual

    const newTextBefore = graphemes.join('');
    inputValue.value = newTextBefore + textAfter;
    caretPosition.value = newTextBefore.length;

    activateCaret(true);
  }
};

  // La función handleBackspaceTouchEnd ha sido eliminada para unificar el comportamiento

  /**
   * toggleShift - Maneja el cambio de estado de la tecla de mayúsculas
   * Ciclo de estados: normal -> seleccionada -> bloqueada -> normal
   * Si está seleccionada, al pulsar otra tecla se deseleccionará
   * Si está bloqueada, solo se puede desbloquear haciendo clic en la tecla
   */
  const toggleShift = () => {
    // Si está bloqueada, al hacer clic se desactiva completamente
    if (shiftLocked.value) {
      shiftLocked.value = false;
      shiftActive.value = false;
    }
    // Si está activa pero no bloqueada, al hacer clic se bloquea
    else if (shiftActive.value) {
      shiftLocked.value = true;
      shiftActive.value = false;
    }
    // Si no está ni activa ni bloqueada, al hacer clic se activa
    else {
      shiftActive.value = true;
    }
  };

  /**
   * closeKeyboard - Cierra el teclado virtual y desactiva el cursor
   */
  const closeKeyboard = () => {
    showKeyboard.value = false;
    deactivateCaret();
  };

  /**
   * handleEnter - Maneja la pulsación de la tecla Enter
   * Emite un evento para notificar que se ha pulsado Enter
   * y cierra el teclado
   */
  const handleEnter = () => {
    emit('keyPressed:enter');
    closeKeyboard();
  };

  /**
   * handleKeyRelease - Maneja el fin de un toque o clic en una tecla
   * Limpia el temporizador de pulsación larga si existe
   */
  const handleKeyRelease = () => {
    // Limpiar el temporizador si existe
    if (longPressTimer.value !== null) {
      window.clearTimeout(longPressTimer.value);
      longPressTimer.value = null;
    }

    // Si el layer está visible, no hacer nada más
    // La selección de teclas especiales se maneja en sus propios manejadores
    if (showSpecialKeysLayer.value) {
      return;
    }
  };


  /**
   * handleKeyMouseDown - Maneja el inicio de un clic largo en una tecla (para dispositivos no táctiles)
   * @param event - El evento de clic
   * @param key - La tecla principal que se está tocando
   * @param specialChars - Caracteres especiales asociados a la tecla
   */
  const handleKeyMouseDown = (event: MouseEvent, key?: string, specialChars?: string | string[]) => {
    if (!key || !specialChars) return;
    console.log("handleKeyMouseDown");
    currentKey.value = key;

    longPressTimer.value = window.setTimeout(() => {
      let element = event.target as HTMLElement;
      if (!element) return;
      //si el elemento no es de tipo .key buscamos el padre más cercano que sea de tipo .key
      if (!element.classList.contains('key')) {
        const parentKeyElement = element.closest('.key') as HTMLElement;
        if (parentKeyElement) {
          element = parentKeyElement;
        }
      }

      // Guardar la referencia a la tecla actual
      currentKeyElement.value = element;

      specialKeysOptions.value = Array.isArray(specialChars) ? specialChars : [specialChars];

      showSpecialKeysLayer.value = true;
    }, 500);
  };

  /**
   * handleKeyPress - Maneja el evento keypress emitido por MyKey
   * @param key - La tecla o tipo de tecla presionada
   */
  const handleKeyPress = (key: string) => {
      if (longPressTimer.value !== null) {
        window.clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
    switch (key) {
      case 'shift':
        toggleShift();
        break;
      case 'backspace':
        backspace();
        break;
      case 'symbol':
        activeKeyboardLayout.value = 'numeric';
        break;
      case 'punctuation':
        activeKeyboardLayout.value = 'punctuation';
        break;
      case 'letters':
        activeKeyboardLayout.value = 'qwerty';
        break;
      case 'emoji':
        activeTab.value = 'emojis';
        break;
      case 'space':
        addChar(' ');
        break;
      case 'enter':
        handleEnter();
        break;
      default:
        // Si no es una tecla especial, añadir el carácter
        addChar(key);
    }
  };

  // Esta función ha sido eliminada ya que no se usa más la tecla Alt

  /**
   * handleKeyMouseUp - Maneja el fin de un clic en una tecla (para dispositivos no táctiles)
   * @param event - El evento de ratón
   */
  const handleKeyMouseUp = (event: MouseEvent | TouchEvent) => {
    // Limpiar el temporizador si existe para evitar que se muestre el layer
    // después de soltar el botón del ratón
    if (longPressTimer.value !== null) {
      window.clearTimeout(longPressTimer.value);
      longPressTimer.value = null;
    }

    // Si el ratón ha salido del layer, no seleccionar ninguna tecla
    if (fingerLeftLayer.value) {
      // Reiniciar la variable para el próximo uso
      fingerLeftLayer.value = false;

      // Ocultar el layer
      showSpecialKeysLayer.value = false;
      return;
    }
    // Si el layer de teclas especiales está visible, verificar si el ratón está dentro del layer
    if (showSpecialKeysLayer.value) {
      const layerElement = document.querySelector('.special-keys-layer');
      if (layerElement) {
        // Verificar que clientX y clientY son números válidos
        // Obtener las coordenadas del ratón del evento, si es un evento tactil obtenerlas del primer toque
        // Esto es importante para evitar errores en dispositivos táctiles
        // y asegurar que el layer se oculta correctamente
        // y no se queda visible al soltar el botón del ratón
        let clientX: number;
        let clientY: number;

        if ('clientX' in event) {
          // Es un MouseEvent
          clientX = event.clientX;
          clientY = event.clientY;
        } else {
          // Es un TouchEvent
          const touch = event.changedTouches && event.changedTouches.length > 0 ? event.changedTouches[0] : null;
          if (!touch) {
            // Si no hay información de toque, ocultar el layer
            showSpecialKeysLayer.value = false;
            return;
          }
          clientX = touch.clientX;
          clientY = touch.clientY;
        }

        if (isNaN(clientX) || !isFinite(clientX) || isNaN(clientY) || !isFinite(clientY)) {
          // Si las coordenadas no son válidas, simplemente ocultar el layer
          showSpecialKeysLayer.value = false;
          return;
        }
        try {
          const elementUnderMouse = document.elementFromPoint(clientX, clientY);
          if (elementUnderMouse && (layerElement.contains(elementUnderMouse) || elementUnderMouse === layerElement)) {
            // Si el ratón está dentro del layer, obtener el main-char de la tecla
            const keyText = elementUnderMouse.textContent?.trim() || '';
            if (keyText) {
              // Usar la tecla encontrada
              selectSpecialKey(keyText);
              return;
            }
          } else {
              console.log('El ratón no está dentro del layer o el elemento no es válido'); // Debugging

          }
        } catch (error) {
          console.error('Error al obtener el elemento bajo el ratón:', error);
          // En caso de error, ocultar el layer
          showSpecialKeysLayer.value = false;
          return;
        }
      }

      // Si el ratón no está dentro del layer, ocultar el layer sin seleccionar ninguna tecla
      showSpecialKeysLayer.value = false;
      return;
    }

    // Si no hay layer visible, proceder normalmente
    handleKeyRelease();

    // No añadimos el carácter aquí, se maneja en el evento click de cada tecla
    // Esto evita la duplicación de caracteres en dispositivos de escritorio
  };

  /**
   * handleKeyMouseEnter - Maneja cuando el cursor del mouse entra en una tecla
   * @param event - El evento de ratón
   * @param keyData - Datos de la tecla
   */
  const handleKeyMouseEnter = (event: MouseEvent, keyData: KeyData) => {
    //cambiar el css de la tecla al pasar el mouse por encima
    const keyElement = event.currentTarget as HTMLElement;
    if (keyElement) {
      keyElement.classList.add('hovered');
    }
    // Si hay un layer de teclas especiales visible, no hacer nada
    if (showSpecialKeysLayer.value) return;

    // Verificar que keyData existe y tiene la propiedad main
    if (keyData && typeof keyData === 'object') {
      // Guardar la tecla actual para usarla en otros eventos
      currentKey.value = keyData.main || '';
    }
  };

  /**
   * handleKeyMouseLeave - Maneja cuando el cursor del mouse sale de una tecla
   * @param event - El evento de ratón
   * @param keyData - Datos de la tecla
   */
  const handleKeyMouseLeave = (event: MouseEvent, keyData: KeyData) => {
    // Cambiar el css de la tecla al salir el mouse
    const keyElement = event.currentTarget as HTMLElement;
    if (keyElement) {
      keyElement.classList.remove('hovered');
    }
    // Si hay un layer de teclas especiales visible, no hacer nada
    if (showSpecialKeysLayer.value) return;

    // Verificar que keyData existe y es un objeto
    if (keyData && typeof keyData === 'object') {
      // Aquí puedes implementar cualquier comportamiento específico cuando el cursor sale de una tecla
      // Por ejemplo, ocultar un tooltip, restaurar el estilo, etc.
    }
  };



  /**
   * handleSpecialKeysLayerLeave - Maneja cuando el ratón sale del layer de teclas especiales
   */
  const handleSpecialKeysLayerLeave = () => {
    // Marcar que el ratón ha salido del layer
    fingerLeftLayer.value = true;

    // Ocultar el layer sin seleccionar ninguna tecla
    showSpecialKeysLayer.value = false;

    // Limpiar la referencia a la tecla actual
    currentKeyElement.value = null;
  };



  /**
   * selectSpecialKey - Selecciona una tecla especial del layer
   * @param key - La tecla especial seleccionada
   */
  const selectSpecialKey = (key: string) => {
      console.log("selectSpecialKey", key);
    try {
      // Añadir el carácter seleccionado
      addChar(key);
    } catch (error) {
      console.error('Error al añadir el carácter especial:', error);
    } finally {
      // Siempre ocultar el layer al final
      showSpecialKeysLayer.value = false;

      // Limpiar el índice de la tecla seleccionada
      currentSpecialKeyIndex.value = -1;

      // Limpiar la referencia a la tecla actual
      currentKeyElement.value = null;
    }
  };


  // Función para manejar el clic en la cruz
  const handleCrossClick = () => {
    if (inputValue.value != '' && props.showEmpty) {
      inputValue.value = '';
      focusInput();
    } else {
      emit('crossClick');
    }
  };

  /**
   * handleFieldClick - Maneja el clic en el campo de entrada
   * Muestra el teclado y activa el cursor inmediatamente
   */
  const handleFieldClick = (event: MouseEvent) => {
    showKeyboard.value = true;

    // Activar el cursor inmediatamente
    activateCaret(true);

    // Si el clic fue directamente en el campo (no en el texto),
    // mover el cursor al final del texto (o al inicio si no hay texto)
    if (event.target === inputFieldRef.value) {
      caretPosition.value = inputValue.value.length;
    }
  };

  /**
   * handlePlaceholderClick - Maneja el clic en el placeholder
   * @param {MouseEvent} event - El evento de clic
   */
  const handlePlaceholderClick = (event: MouseEvent) => {
    // Mostrar el teclado
    showKeyboard.value = true;

    // Activar el cursor
    activateCaret(true);

    // Posicionar el cursor al inicio (posición 0)
    caretPosition.value = 0;
  };

  /**
   * handleTextClick - Maneja el clic en el texto para posicionar el cursor
   * @param {MouseEvent} event - El evento de clic
   */
  const handleTextClick = (event: MouseEvent) => {
    // Mostrar el teclado
    showKeyboard.value = true;

    // Activar el cursor
    activateCaret(true);

    // Calcular la posición aproximada del cursor basada en el clic
    const textElement = event.currentTarget as HTMLElement;
    const rect = textElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    // Obtener el texto sin HTML
    const plainText = inputValue.value;

    // Calcular la posición aproximada basada en la proporción del ancho
    let approximatePosition = Math.round((clickX / rect.width) * plainText.length);

    // Asegurarse de que la posición esté dentro de los límites
    approximatePosition = Math.max(0, Math.min(approximatePosition, plainText.length));

    // Establecer la posición del cursor
    caretPosition.value = approximatePosition;
  };

  /**
   * activateCaret - Activa el cursor y configura su parpadeo
   * @param {boolean} immediate - Si es true, el cursor se muestra inmediatamente sin parpadeo inicial
   */
  const activateCaret = (immediate = true) => {
    // Mostrar el cursor inmediatamente si se solicita
    showCaret.value = immediate;

    // Limpiar cualquier intervalo existente
    if (caretBlinkInterval.value !== null) {
      window.clearInterval(caretBlinkInterval.value);
    }

    // Configurar el parpadeo del cursor
    caretBlinkInterval.value = window.setInterval(() => {
      showCaret.value = !showCaret.value;
    }, 500); // Parpadeo cada 500ms
  };

  /**
   * deactivateCaret - Desactiva el cursor y detiene su parpadeo
   */
  const deactivateCaret = () => {
    showCaret.value = false;

    if (caretBlinkInterval.value !== null) {
      window.clearInterval(caretBlinkInterval.value);
    }
  };

  // Función para enfocar el input
  const focusInput = () => {
    if (props.autoFocus && inputFieldRef.value) {
      inputFieldRef.value.focus();
      showKeyboard.value = true;
      activateCaret(true);
      caretPosition.value = inputValue.value.length; // Cursor al final
    }
  };

  // Texto con el cursor (caret) insertado en la posición correcta
  const textWithCaret = computed(() => {
    // Si no hay texto, este computed no se usa (se maneja en el template)
    if (!inputValue.value) return '';

    // Si no se debe mostrar el cursor, devolver el texto tal cual
    if (!showCaret.value) return inputValue.value;

    // Si el cursor está al final del texto
    if (caretPosition.value >= inputValue.value.length) {
      // El cursor va al final
      return inputValue.value + '<span class="caret"></span>';
    }

    // Si el cursor está en medio del texto
    const textBefore = inputValue.value.substring(0, caretPosition.value);
    const textAfter = inputValue.value.substring(caretPosition.value);

    return textBefore + '<span class="caret"></span>' + textAfter;
  });

  // Observadores
  watch(() => props.modelValue, newValue => inputValue.value = newValue);
  watch(inputValue, newValue => emit('updateValue', newValue));

  // La función handleEmojiTouchEnd ha sido eliminada para unificar el comportamiento

  /**
   * handleSpecialLayerTouchMove - Maneja el movimiento táctil sobre el layer de teclas especiales
   * @param event - El evento de movimiento táctil
   */
  const handleSpecialLayerTouchMove = (event: TouchEvent) => {
    // Solo procesar si el layer está visible
    if (!showSpecialKeysLayer.value) return;

    // Asegurarnos de que el evento no se propague y no cause desplazamiento
    event.preventDefault();
    event.stopPropagation();

    // Obtener las coordenadas del toque
    const touch = event.touches && event.touches.length > 0 ? event.touches[0] : null;
    if (!touch) return;

    // Verificar que clientX y clientY son números válidos
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    if (isNaN(clientX) || !isFinite(clientX) || isNaN(clientY) || !isFinite(clientY)) {
      // Si las coordenadas no son válidas, simplemente ignorar este evento
      return;
    }

    let elementUnderTouch;
    try {
      // Obtener el elemento que está bajo el dedo
      elementUnderTouch = document.elementFromPoint(clientX, clientY);
      if (!elementUnderTouch) return;
    } catch (error) {
      console.error('Error al obtener el elemento bajo el dedo:', error);
      return;
    }

    // Verificar si el dedo está dentro del layer
    const layerElement = document.querySelector('.special-keys-layer');
    if (!layerElement) return;

    // Comprobar si el elemento tocado está dentro del layer
    const isInsideLayer = layerElement.contains(elementUnderTouch) || elementUnderTouch === layerElement;

    // Si el dedo ha salido del layer, marcar la variable y ocultar el layer
    if (!isInsideLayer) {
      fingerLeftLayer.value = true;
      showSpecialKeysLayer.value = false;
      return;
    }

    // Si el dedo vuelve a entrar en el layer después de haber salido, no hacer nada
    if (fingerLeftLayer.value) return;

    // Buscar si el elemento o alguno de sus padres es una tecla especial
    const keyElement = elementUnderTouch.closest('.special-option-key');
    if (!keyElement) return;

    try {
      // Obtener el índice directamente del atributo de datos
      const keyIndex = parseInt(keyElement.getAttribute('data-index') || '-1');

      // Si no podemos obtener el índice del atributo, intentar calcularlo
      if (keyIndex === -1) {
        const container = keyElement.parentElement;
        if (!container) return;

        const allKeys = Array.from(container.querySelectorAll('.special-option-key'));
        const calculatedIndex = allKeys.indexOf(keyElement as Element);

        if (calculatedIndex >= 0) {
          // Actualizar el índice de la tecla seleccionada
          currentSpecialKeyIndex.value = calculatedIndex;
        }
      } else {
        // Usar el índice del atributo
        currentSpecialKeyIndex.value = keyIndex;
      }
    } catch (error) {
      console.error('Error al procesar el movimiento táctil:', error);
    }
  };


  // Función para manejar eventos táctiles globales
  const handleGlobalTouchMove = (event: TouchEvent) => {
    if (showSpecialKeysLayer.value) {
      handleSpecialLayerTouchMove(event);
    }
  };

  const handleGlobalTouchEnd = (event: TouchEvent) => {
    // Si el dedo ha salido del layer, no seleccionar ninguna tecla
    if (fingerLeftLayer.value) {
      // Reiniciar la variable para el próximo uso
      fingerLeftLayer.value = false;

      // Limpiar el temporizador si existe
      if (longPressTimer.value !== null) {
        window.clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }

      return;
    }

    if (showSpecialKeysLayer.value) {
      // Usar la misma lógica que en handleKeyTouchEnd para seleccionar la tecla especial
      try {
        // Obtener las coordenadas del toque
        const touch = event.changedTouches && event.changedTouches.length > 0 ? event.changedTouches[0] : null;
        if (!touch) {
          // Si no hay información de toque, no seleccionar ninguna tecla
          showSpecialKeysLayer.value = false;
          return;
        }

        // Obtener el elemento que está bajo el dedo al levantar
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!elementUnderTouch) {
          // Si no hay elemento bajo el dedo, no seleccionar ninguna tecla
          showSpecialKeysLayer.value = false;
          return;
        }

        // Verificar si el elemento está dentro del layer
        const layerElement = document.querySelector('.special-keys-layer');
        if (layerElement && !layerElement.contains(elementUnderTouch) && elementUnderTouch !== layerElement) {
          // Si el elemento no está dentro del layer, no seleccionar ninguna tecla
          showSpecialKeysLayer.value = false;
          return;
        }

        // Buscar si el elemento o alguno de sus padres es una tecla especial
        const keyElement = elementUnderTouch.closest('.special-option-key');
        if (keyElement) {
          // Obtener el texto de la tecla directamente del elemento
          const keyText = keyElement.textContent?.trim();
          if (keyText) {
            // Usar la tecla encontrada
            selectSpecialKey(keyText);
          } else {
            // Si no podemos obtener el texto, intentar usar el índice
            const keyIndex = parseInt(keyElement.getAttribute('data-index') || '-1');
            if (keyIndex >= 0 && keyIndex < specialKeysOptions.value.length) {
              selectSpecialKey(specialKeysOptions.value[keyIndex]);
            } else {
              // Si no podemos determinar el índice, no seleccionar ninguna tecla
              showSpecialKeysLayer.value = false;
            }
          }
        } else {
          // Si no hay tecla bajo el dedo, no seleccionar ninguna tecla
          showSpecialKeysLayer.value = false;
        }
      } catch (error) {
        console.error('Error al procesar el fin del toque global:', error);
        // En caso de error, no seleccionar ninguna tecla
        showSpecialKeysLayer.value = false;
      }
    }
  };

  // Variables unificadas para eventos táctiles
  const touchStartTime = ref(0);
  const touchTimer = ref<number | null>(null);

  // Limpiar temporizador al desmontar
  onUnmounted(() => {
    if (touchTimer.value !== null) {
      clearTimeout(touchTimer.value);
      touchTimer.value = null;
    }
  });


  // Eventos del ciclo de vida
  onMounted(() => {
    setTimeout(() => focusInput(), 100);

    // Activar mayúsculas por defecto cuando no hay texto
    watch(inputValue, (newValue) => {
      if (newValue === '') {
        shiftActive.value = true;
      }
    }, { immediate: true });

    // Añadir manejadores de eventos táctiles globales
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
  });

  // Limpiar el intervalo del cursor cuando el componente se desmonte
  onUnmounted(() => {
    if (caretBlinkInterval.value !== null) {
      window.clearInterval(caretBlinkInterval.value);
    }

    // Limpiar el temporizador de longpress si existe
    if (longPressTimer.value !== null) {
      window.clearTimeout(longPressTimer.value);
    }

    // Eliminar manejadores de eventos táctiles globales
    document.removeEventListener('touchmove', handleGlobalTouchMove);
    document.removeEventListener('touchend', handleGlobalTouchEnd);
  });

  // Las emisiones ya están definidas al inicio del script

  // Exponer variables y funciones
  defineExpose({
    inputValue
  });
</script>
