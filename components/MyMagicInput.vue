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
            <div
              v-if="!key.type || key.type === 'normal'"
              class="key"
              :style="key.position ? { 'align-items': key.position } : {}"
              :class="{ 'multi-char': key.special && key.special.length > 0 }"
              @click.stop="key.main && addChar(key.main)"
              @touchstart.stop.prevent="key.main && (key.special && key.special.length > 0 ? handleKeyTouchStart($event, key.main, key.special) : handleKeyTouchStart($event, key.main))"
              @touchend.stop.prevent="handleKeyTouchEnd($event)"
              @mousedown.stop.prevent="key.main && (key.special && key.special.length > 0 ? handleKeyMouseDown($event, key.main, key.special) : handleKeyMouseDown($event, key.main))"
              @mouseup.stop="handleKeyMouseUp($event)"
            >
              <span class="main-char">
                {{ key.upper && (shiftActive || shiftLocked) ? key.upper : (key.main || '') }}
              </span>
              <span v-if="key.special && key.special.length > 0" class="alt-char">
                {{ key.super?? (Array.isArray(key.special) ? key.special.join(' ') : key.special) }}
              </span>
            </div>

            <div
              v-else-if="key.type === 'shift'"
              class="key mayus-key shift-key"
              :style="key.position ? { 'align-items': key.position } : {}"
              @click.stop="toggleShift"
              @touchend.stop="toggleShift"
              :class="{ 'shift-active': shiftActive, 'shift-locked': shiftLocked }"
            >
            </div>

            <div
              v-else-if="key.type === 'special'"
              class="key special-key"
              :style="key.position ? { 'align-items': key.position } : {}"
              @click.stop="backspace"
              @touchend.stop.prevent="handleBackspaceTouchEnd"
            >
              {{ key.text }}
            </div>

            <div
              v-else-if="key.type === 'symbol'"
              class="key symbol-key"
              :style="key.position ? { 'align-items': key.position } : {}"
              @click.stop="showNumericKeyboard"
              @touchend.stop="showNumericKeyboard"
            >
              {{ key.text }}
            </div>

            <div
              v-else-if="key.type === 'emoji'"
              class="key emoji-key"
              :style="key.position ? { 'align-items': key.position } : {}"
              @click.stop="activeTab = 'emojis'"
              @touchend.stop="activeTab = 'emojis'"
            >
              {{ key.text }}
            </div>

            <div
              v-else-if="key.type === 'space'"
              class="key space-key"
              :style="key.position ? { 'align-items': key.position } : {}"
              @click.stop="addChar(' ')"
              @touchend.stop="addChar(' ')"
            >
              {{ key.text }}
            </div>

            <div
              v-else-if="key.type === 'enter'"
              class="key enter-key"
              :style="key.position ? { 'align-items': key.position } : {}"
              @click.stop="handleEnter"
              @touchend.stop="handleEnter"
            >
              <span class="enter-arrow">{{ key.text }}</span>
            </div>
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
          <div
            v-for="emoji in emojiCategories[activeEmojiCategory].emojis"
            :key="emoji"
            class="emoji-item"
            @click.stop="addChar(emoji)"
            @touchend.stop.prevent="handleEmojiTouchEnd(emoji)"
          >
            {{ emoji }}
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showSpecialKeysLayer" class="special-keys-layer"
           :style="{
             position: 'fixed',
             top: layerTop,
             left: layerLeft,
             width: layerWidth,
             zIndex: '9999'
           }"
           @mouseleave="handleSpecialKeysLayerLeave"
           @mouseup="handleSpecialKeysLayerMouseUp"
           @touchend="handleSpecialKeysLayerTouchEnd"
           @touchmove.prevent="handleSpecialLayerTouchMove">
        <div class="special-keys-container">
          <div
            v-for="(key, index) in specialKeysOptions"
            :key="index"
            class="key special-option-key"
            :class="{ 'active': currentSpecialKeyIndex === index }"
            :style="{ '--index': index }"
            :data-index="index"
            :data-key="key"
            @mouseenter="currentSpecialKeyIndex = index"
            @click="selectSpecialKey(key, $event)"
            @touchstart.prevent="currentSpecialKeyIndex = index"
            @touchend.prevent="selectSpecialKey(key, $event)"
          >
            {{ key }}
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
  import type { PropType } from 'vue';
  import { generateID } from '~/utils';
  import { myStore } from '~/composables/useStore';
  import '~/css/components/MyMagicInput.css';

  // Importar layouts
  import qwertyLayout from '~/assets/osk/qwerty.layout.json';
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
    customKeyboard:   { type: Object as PropType<KeyboardLayout>,   default: null }
  });

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
  const lastShiftClick = ref(0);
  const activeEmojiCategory = ref(0);

  // Variables para el layer de teclas especiales
  const showSpecialKeysLayer = ref(false);
  const specialKeysOptions = ref<string[]>([]);
  const fingerLeftLayer = ref(false); // Indica si el dedo ha salido del layer

  // Variables para almacenar las coordenadas del layer
  const layerTop = ref('0px');
  const layerLeft = ref('0px');
  const layerWidth = ref('auto');

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

  /**
   * defaultKeyboardLayout - Usa la estructura predeterminada del teclado desde el archivo JSON importado
   * Contiene la definición de todas las filas y teclas del teclado virtual
   */
  const defaultKeyboardLayout: KeyboardLayout = {
    rows: qwertyLayout.rows.map(row => ({
      ...row,
      position: row.position as 'center' | 'end' | 'start' | undefined,
      keys: row.keys.map(key => ({
        ...key,
        position: key.position as 'center' | 'end' | 'start' | undefined,
        type: (['normal', 'shift', 'special', 'symbol', 'emoji', 'space', 'enter'] as const).includes(key.type as any)
          ? key.type as 'normal' | 'shift' | 'special' | 'symbol' | 'emoji' | 'space' | 'enter'
          : undefined
      }))
    }))
  };

  // Usar el teclado personalizado si se proporciona, o el predeterminado si no
  const keyboardLayout = ref<KeyboardLayout>(props.customKeyboard || defaultKeyboardLayout);

  // Observar cambios en la propiedad customKeyboard
  watch(() => props.customKeyboard, (newKeyboard: KeyboardLayout | null) => {
    if (newKeyboard) {
      keyboardLayout.value = newKeyboard;
    } else {
      keyboardLayout.value = defaultKeyboardLayout;
    }
  });

  // Definición de interfaces para el teclado
  interface KeyboardKey {
    main?: string;
    upper?: string;
    position?: 'center' | 'end' | 'start';
    special?: string | string[];
    super?: string;
    type?: 'normal' | 'shift' | 'special' | 'symbol' | 'emoji' | 'space' | 'enter';
    text?: string;
    action?: string;
  }

  interface KeyboardRow {
    id: string;
    position?: 'center' | 'end' | 'start';
    keys: KeyboardKey[];
  }

  interface KeyboardLayout {
    rows: KeyboardRow[];
  }

  /**
   * createKeyboardLayout - Función auxiliar para crear un teclado personalizado
   * @param customLayout - Objeto con la configuración personalizada del teclado
   * @returns Objeto con la configuración completa del teclado
   *
   * Esta función se expone para que pueda ser utilizada desde fuera del componente
   * para facilitar la creación de teclados personalizados.
   */
  const createKeyboardLayout = (customLayout: Partial<KeyboardLayout>): KeyboardLayout => {
    // Si se proporciona un objeto completo, devolverlo tal cual
    if (customLayout && customLayout.rows) {
      return customLayout as KeyboardLayout;
    }

    // Si no, crear un objeto basado en el teclado predeterminado
    return {
      ...defaultKeyboardLayout,
      ...customLayout
    } as KeyboardLayout;
  };

  // La función createKeyboardLayout estará disponible para ser utilizada desde fuera

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
    // Si el cursor no está al principio, borrar el carácter a la izquierda
    if (caretPosition.value > 0) {
      // Obtener el texto antes del cursor
      const textBefore = inputValue.value.substring(0, caretPosition.value);
      const textAfter = inputValue.value.substring(caretPosition.value);

      // Verificar si el último carácter es parte de un emoji
      // Los emojis suelen estar en el rango de surrogate pairs (U+D800 a U+DFFF)
      let charsToDelete = 1;

      // Si estamos en posición de borrar al menos un carácter
      if (caretPosition.value >= 1) {
        const lastChar = textBefore.charAt(textBefore.length - 1);
        const secondLastChar = caretPosition.value >= 2 ? textBefore.charAt(textBefore.length - 2) : '';

        // Verificar si es un emoji (surrogate pair)
        const isHighSurrogate = secondLastChar && secondLastChar.charCodeAt(0) >= 0xD800 && secondLastChar.charCodeAt(0) <= 0xDBFF;
        const isLowSurrogate = lastChar.charCodeAt(0) >= 0xDC00 && lastChar.charCodeAt(0) <= 0xDFFF;

        // Si es un emoji completo (surrogate pair), borrar 2 caracteres
        if (isHighSurrogate && isLowSurrogate) {
          charsToDelete = 2;
        }
      }

      // Borrar la cantidad correcta de caracteres
      const newTextBefore = textBefore.substring(0, textBefore.length - charsToDelete);
      inputValue.value = newTextBefore + textAfter;

      // Retroceder la posición del cursor
      caretPosition.value -= charsToDelete;

      // Reactivar el cursor
      activateCaret(true);
    }
  };

  /**
   * handleBackspaceTouchEnd - Maneja el evento táctil para la tecla de retroceso
   * Evita la duplicación en dispositivos móviles
   */
  const handleBackspaceTouchEnd = (event: TouchEvent) => {
    // Verificamos si estamos en un dispositivo móvil (táctil)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Si es un dispositivo táctil, ejecutamos backspace directamente
    // El evento click posterior será ignorado por el .stop en el template
    if (isTouchDevice) {
      backspace();
    }
    // Si no es un dispositivo táctil, no hacemos nada y dejamos que el evento click lo maneje
  };

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
   * handleKeyTouchStart - Maneja el inicio de un toque largo en una tecla (para dispositivos táctiles)
   * @param event - El evento de toque
   * @param key - La tecla principal que se está tocando
   * @param specialChars - Caracteres especiales asociados a la tecla
   */
  const handleKeyTouchStart = (event: TouchEvent, key: string, specialChars?: string | string[]) => {
    handleKeyPress(event, key, specialChars);
  };

  /**
   * handleKeyMouseDown - Maneja el inicio de un clic largo en una tecla (para dispositivos no táctiles)
   * @param event - El evento de clic
   * @param key - La tecla principal que se está tocando
   * @param specialChars - Caracteres especiales asociados a la tecla
   */
  const handleKeyMouseDown = (event: MouseEvent, key: string, specialChars?: string | string[]) => {
    handleKeyPress(event, key, specialChars);
  };

  /**
   * handleKeyPress - Maneja el inicio de un toque o clic largo en una tecla
   * @param event - El evento de toque o clic
   * @param key - La tecla principal que se está tocando
   * @param specialChars - Caracteres especiales asociados a la tecla
   */
  const handleKeyPress = (event: Event, key: string, specialChars?: string | string[]) => {
    // Guardar la tecla actual para usarla en el evento de liberación
    currentKey.value = key;

    // Si la tecla no tiene caracteres especiales, no hacer nada más
    if (!specialChars || (Array.isArray(specialChars) && specialChars.length === 0)) {
      return;
    }

    // Configurar un temporizador para detectar un toque/clic largo
    longPressTimer.value = window.setTimeout(() => {
      try {
        // Obtener el elemento que desencadenó el evento
        const element = event.target as HTMLElement;
        if (!element) {
          console.error('No se pudo obtener el elemento que desencadenó el evento');
          return;
        }

        // Buscar el elemento de la tecla (puede ser el propio elemento o un ancestro)
        const keyElement = element.closest('.key');
        if (!keyElement) {
          console.error('No se pudo encontrar el elemento de la tecla');
          return;
        }

        // Obtener las coordenadas del elemento de la tecla
        const keyRect = keyElement.getBoundingClientRect();

        // Configurar las opciones de teclas especiales
        if (Array.isArray(specialChars)) {
          specialKeysOptions.value = specialChars;
        } else {
          specialKeysOptions.value = [specialChars];
        }

        // Calcular el ancho del layer basado en el número de teclas especiales
        const layerWidthValue = specialKeysOptions.value.length * 50; // 50px por tecla aproximadamente
        const layerHeight = 40; // Altura aproximada del layer en píxeles

        // Calcular la posición exacta del layer (centrado sobre la tecla)
        // Subimos 10 píxeles la posición vertical para mejorar la visibilidad
        let topPosition = keyRect.top - 10;
        let leftPosition = keyRect.left + (keyRect.width / 2) - (layerWidthValue / 2);

        // Asegurarnos de que el layer no se salga de la pantalla
        if (topPosition < 10) {
          topPosition = 10;
        } else if (topPosition + layerHeight > window.innerHeight - 10) {
          topPosition = window.innerHeight - layerHeight - 10;
        }

        if (leftPosition < 10) {
          leftPosition = 10;
        } else if (leftPosition + layerWidthValue > window.innerWidth - 10) {
          leftPosition = window.innerWidth - layerWidthValue - 10;
        }

        // Actualizar las variables de posición del layer
        layerTop.value = `${topPosition}px`;
        layerLeft.value = `${leftPosition}px`;
        layerWidth.value = `${layerWidthValue}px`;

        // Mostrar el layer
        showSpecialKeysLayer.value = true;

        // Inicializar el índice de la tecla seleccionada
        currentSpecialKeyIndex.value = -1;
      } catch (error) {
        console.error('Error al posicionar el layer:', error);
      }
    }, 500); // 500ms para considerar un toque/clic largo
  };

  // Esta función ha sido eliminada ya que no se usa más la tecla Alt

  /**
   * handleKeyTouchEnd - Maneja el fin de un toque en una tecla (para dispositivos táctiles)
   * @param event - El evento de fin de toque
   */
  const handleKeyTouchEnd = (event: TouchEvent) => {
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

    // Si el layer de teclas especiales está visible, seleccionar la tecla especial bajo el dedo
    if (showSpecialKeysLayer.value) {
      try {
        // Obtener las coordenadas del toque
        const touch = event.changedTouches[0];
        if (!touch) {
          // Si no hay información de toque, usar la primera tecla especial disponible o la seleccionada
          if (currentSpecialKeyIndex.value >= 0 && currentSpecialKeyIndex.value < specialKeysOptions.value.length) {
            selectSpecialKey(specialKeysOptions.value[currentSpecialKeyIndex.value]);
          } else if (specialKeysOptions.value.length > 0) {
            selectSpecialKey(specialKeysOptions.value[0]);
          } else {
            showSpecialKeysLayer.value = false;
          }
          return;
        }

        // Obtener el elemento que está bajo el dedo al levantar
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!elementUnderTouch) {
          // Si no hay elemento bajo el dedo, usar la tecla seleccionada o la primera disponible
          if (currentSpecialKeyIndex.value >= 0 && currentSpecialKeyIndex.value < specialKeysOptions.value.length) {
            selectSpecialKey(specialKeysOptions.value[currentSpecialKeyIndex.value]);
          } else if (specialKeysOptions.value.length > 0) {
            selectSpecialKey(specialKeysOptions.value[0]);
          } else {
            showSpecialKeysLayer.value = false;
          }
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
            } else if (currentSpecialKeyIndex.value >= 0 && currentSpecialKeyIndex.value < specialKeysOptions.value.length) {
              // Si no podemos determinar el índice, usar la tecla seleccionada
              selectSpecialKey(specialKeysOptions.value[currentSpecialKeyIndex.value]);
            } else if (specialKeysOptions.value.length > 0) {
              // Si no hay tecla seleccionada, usar la primera disponible
              selectSpecialKey(specialKeysOptions.value[0]);
            } else {
              showSpecialKeysLayer.value = false;
            }
          }
        } else {
          // Si no hay tecla bajo el dedo, no seleccionar ninguna tecla
          showSpecialKeysLayer.value = false;
        }
      } catch (error) {
        console.error('Error al procesar el fin del toque en la tecla:', error);
        // En caso de error, no seleccionar ninguna tecla
        showSpecialKeysLayer.value = false;
      }
      return;
    }

    // Si no hay layer visible, proceder normalmente
    handleKeyRelease();

    // Añadir el carácter normal si no se ha seleccionado una tecla especial
    if (currentKey.value) {
      addChar(currentKey.value);
    }
  };

  /**
   * handleKeyMouseUp - Maneja el fin de un clic en una tecla (para dispositivos no táctiles)
   * @param event - El evento de ratón
   */
  const handleKeyMouseUp = (event: MouseEvent) => {
    // Si el ratón ha salido del layer, no seleccionar ninguna tecla
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

    // Si el layer de teclas especiales está visible, verificar si el ratón está dentro del layer
    if (showSpecialKeysLayer.value) {
      const layerElement = document.querySelector('.special-keys-layer');
      if (layerElement) {
        const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY);
        if (elementUnderMouse && (layerElement.contains(elementUnderMouse) || elementUnderMouse === layerElement)) {
          // Si el ratón está dentro del layer, dejar que el evento mouseup del layer maneje la selección
          return;
        }
      }

      // Si el ratón no está dentro del layer, ocultar el layer sin seleccionar ninguna tecla
      showSpecialKeysLayer.value = false;
      return;
    }

    // Si no hay layer visible, proceder normalmente
    handleKeyRelease();

    // Ya no añadimos el carácter aquí, se maneja en el evento click de cada tecla
    // Esto evita la duplicación de caracteres en dispositivos de escritorio
  };

  /**
   * handleSpecialKeysLayerLeave - Maneja cuando el ratón sale del layer de teclas especiales
   */
  const handleSpecialKeysLayerLeave = () => {
    // Marcar que el ratón ha salido del layer
    fingerLeftLayer.value = true;

    // Ocultar el layer sin seleccionar ninguna tecla
    showSpecialKeysLayer.value = false;
  };

  /**
   * handleSpecialKeysLayerMouseUp - Maneja cuando se suelta el botón del ratón sobre el layer
   * @param event - El evento de ratón
   */
  const handleSpecialKeysLayerMouseUp = (event: MouseEvent) => {
    // Si el ratón ha salido del layer, no seleccionar ninguna tecla
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

    // Verificar si el elemento está dentro del layer
    const layerElement = document.querySelector('.special-keys-layer');
    if (layerElement) {
      const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY);
      if (elementUnderMouse && !layerElement.contains(elementUnderMouse) && elementUnderMouse !== layerElement) {
        // Si el elemento no está dentro del layer, no seleccionar ninguna tecla
        showSpecialKeysLayer.value = false;
        return;
      }
    }

    // Si se ha seleccionado una tecla, usarla
    if (currentSpecialKeyIndex.value >= 0 && currentSpecialKeyIndex.value < specialKeysOptions.value.length) {
      selectSpecialKey(specialKeysOptions.value[currentSpecialKeyIndex.value]);
    } else {
      // Si no hay tecla seleccionada, simplemente ocultar el layer
      showSpecialKeysLayer.value = false;
    }
  };

  // La función handleSpecialLayerTouchMove ya está definida más adelante en el código

  /**
   * handleSpecialKeysLayerTouchEnd - Maneja cuando se levanta el dedo del layer de teclas especiales
   * @param event - El evento de fin de toque
   */
  const handleSpecialKeysLayerTouchEnd = (event: TouchEvent) => {
    // Solo procesar si el layer está visible
    if (!showSpecialKeysLayer.value) return;

    // Prevenir comportamientos predeterminados
    event.preventDefault();
    event.stopPropagation();

    try {
      // Si hay una tecla seleccionada, usarla
      if (currentSpecialKeyIndex.value >= 0 && currentSpecialKeyIndex.value < specialKeysOptions.value.length) {
        const selectedKey = specialKeysOptions.value[currentSpecialKeyIndex.value];
        selectSpecialKey(selectedKey);
        return;
      }

      // Si no hay tecla seleccionada, intentar detectar la tecla bajo el dedo
      const touch = event.changedTouches[0];
      if (!touch) {
        // Si no hay información de toque, usar la primera tecla especial disponible
        if (specialKeysOptions.value.length > 0) {
          selectSpecialKey(specialKeysOptions.value[0]);
        } else {
          showSpecialKeysLayer.value = false;
        }
        return;
      }

      // Obtener el elemento que está bajo el dedo al levantar
      const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!elementUnderTouch) {
        // Si no hay elemento bajo el dedo, usar la primera tecla especial disponible
        if (specialKeysOptions.value.length > 0) {
          selectSpecialKey(specialKeysOptions.value[0]);
        } else {
          showSpecialKeysLayer.value = false;
        }
        return;
      }

      // Buscar si el elemento o alguno de sus padres es una tecla especial
      const keyElement = elementUnderTouch.closest('.special-option-key');
      if (!keyElement) {
        // Si no hay tecla bajo el dedo, buscar la tecla más cercana a las coordenadas del toque
        const specialKeysContainer = document.querySelector('.special-keys-container');
        if (specialKeysContainer) {
          const allKeys = Array.from(specialKeysContainer.querySelectorAll('.special-option-key'));

          // Si hay teclas disponibles, seleccionar la primera por defecto
          if (allKeys.length > 0) {
            let closestKey = allKeys[0];
            let closestDistance = Number.MAX_VALUE;

            // Buscar la tecla más cercana a las coordenadas del toque
            allKeys.forEach((key) => {
              const rect = key.getBoundingClientRect();
              const keyX = rect.left + rect.width / 2;
              const keyY = rect.top + rect.height / 2;
              const distance = Math.sqrt(
                Math.pow(touch.clientX - keyX, 2) + Math.pow(touch.clientY - keyY, 2)
              );

              if (distance < closestDistance) {
                closestDistance = distance;
                closestKey = key;
              }
            });

            // Obtener el texto de la tecla más cercana
            const keyText = closestKey.textContent?.trim();
            if (keyText) {
              selectSpecialKey(keyText);
              return;
            }
          }
        }

        // Si todo lo demás falla, usar la primera tecla especial disponible
        if (specialKeysOptions.value.length > 0) {
          selectSpecialKey(specialKeysOptions.value[0]);
        } else {
          showSpecialKeysLayer.value = false;
        }
        return;
      }

      // Obtener el texto de la tecla directamente del elemento
      const keyText = keyElement.textContent?.trim();
      if (keyText) {
        // Usar la tecla encontrada
        selectSpecialKey(keyText);
      } else {
        // Si no podemos obtener el texto, intentar usar el índice
        const container = keyElement.parentElement;
        if (container) {
          const allKeys = Array.from(container.querySelectorAll('.special-option-key'));
          const keyIndex = allKeys.indexOf(keyElement as Element);
          if (keyIndex >= 0 && keyIndex < specialKeysOptions.value.length) {
            selectSpecialKey(specialKeysOptions.value[keyIndex]);
          } else if (specialKeysOptions.value.length > 0) {
            // Si no podemos determinar el índice, usar la primera tecla disponible
            selectSpecialKey(specialKeysOptions.value[0]);
          } else {
            showSpecialKeysLayer.value = false;
          }
        } else if (specialKeysOptions.value.length > 0) {
          // Si no hay contenedor, usar la primera tecla disponible
          selectSpecialKey(specialKeysOptions.value[0]);
        } else {
          showSpecialKeysLayer.value = false;
        }
      }
    } catch (error) {
      console.error('Error al procesar el fin del toque:', error);
      // En caso de error, intentar usar la primera tecla disponible
      if (specialKeysOptions.value.length > 0) {
        selectSpecialKey(specialKeysOptions.value[0]);
      } else {
        showSpecialKeysLayer.value = false;
      }
    }
  };

  /**
   * handleSpecialKeyTouchMove - Maneja el movimiento táctil sobre las teclas especiales
   * @param event - El evento de movimiento táctil
   * @param index - El índice de la tecla sobre la que se está moviendo
   */
  const handleSpecialKeyTouchMove = (event: TouchEvent, index: number) => {
    // Prevenir el comportamiento predeterminado para evitar el desplazamiento
    event.preventDefault();
    event.stopPropagation();

    // Obtener el elemento tocado
    const touch = event.touches[0];
    if (!touch) return;

    // Encontrar el elemento que está bajo el dedo
    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementUnderTouch) return;

    // Buscar el elemento de tecla especial más cercano
    const keyElement = elementUnderTouch.closest('.special-option-key');
    if (!keyElement) return;

    // Obtener el índice de la tecla desde la posición en el contenedor
    const keyIndex = Array.from(keyElement.parentElement?.children || []).indexOf(keyElement as Element);
    if (keyIndex >= 0) {
      // Actualizar el índice de la tecla seleccionada
      currentSpecialKeyIndex.value = keyIndex;
    }
  };

  /**
   * selectSpecialKey - Selecciona una tecla especial del layer
   * @param key - La tecla especial seleccionada
   * @param event - El evento que desencadenó la selección (opcional)
   */
  const selectSpecialKey = (key: string, event?: Event) => {
    // Detener la propagación del evento si existe
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

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
    }
  };

  /**
   * showNumericKeyboard - Cambia a la disposición numérica del teclado
   * Esta función es un placeholder para una futura implementación
   * Por ahora, simplemente muestra un mensaje en la consola
   */
  const showNumericKeyboard = () => {
    console.log('Función showNumericKeyboard: Esta funcionalidad será implementada en futuras versiones');
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
      caretBlinkInterval.value = null;
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

  /**
   * handleEmojiTouchEnd - Maneja el evento táctil para los emojis en dispositivos móviles
   * Evita la duplicación de pulsaciones que ocurre cuando se disparan tanto click como touchend
   * @param emoji - El emoji seleccionado
   */
  const handleEmojiTouchEnd = (emoji: string) => {
    // En dispositivos móviles, el evento touchend también dispara un evento click
    // Para evitar la duplicación, usamos una variable para controlar si ya se procesó el emoji

    // Verificamos si estamos en un dispositivo móvil (táctil)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Si es un dispositivo táctil, añadimos el emoji directamente
    // El evento click posterior será ignorado por el .stop en el template
    if (isTouchDevice) {
      addChar(emoji);
    }
    // Si no es un dispositivo táctil, no hacemos nada y dejamos que el evento click lo maneje
  };

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
    const touch = event.touches[0];
    if (!touch) return;

    // Obtener el elemento que está bajo el dedo
    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementUnderTouch) return;

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
        const touch = event.changedTouches[0];
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
    inputValue,
    createKeyboardLayout
  });
</script>