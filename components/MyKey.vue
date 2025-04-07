<template>
  <div
    ref="keyElement"
    class="key"
    :class="[
      keyTypeClass,
      { 'multi-char': hasSpecialChars, 'shift-active': isShiftActive, 'shift-locked': isShiftLocked }
    ]"

    :style="keyStyle"
    @click="handleClick"
    @touchstart.stop.prevent="handleTouchStart"
    @touchend.stop.prevent="handleTouchEnd"
    @mousedown.stop="handleMouseDown"
    @mouseup.stop="handleMouseUp"
    @mouseenter.stop="handleMouseEnter"
    @mouseleave.stop="handleMouseLeave"
    @touchenter.stop.prevent="handleTouchEnter"
    @touchleave.stop.prevent="handleTouchLeave"
  >
    <span v-if="showMainChar" class="main-char">
      {{ displayChar }}
    </span>
    <span v-if="hasSpecialChars" class="alt-char">
      {{ specialDisplay }}
    </span>
    <span v-if="props.keyData.type === 'enter'" class="enter-arrow">↵</span>
    <span v-if="props.keyData.type === 'backspace'" class="backspace-icon">⌫</span>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import type { PropType } from 'vue';
import type { KeyData } from '@/types';

/**
 * keyElement - Referencia al elemento div.key
 * Permite acceder al elemento DOM de la tecla actual desde cualquier parte del componente
 */
const keyElement = ref<HTMLDivElement | null>(null);

const props = defineProps({
  keyData:      { type: Object as PropType<KeyData>,  required: true },
  shiftActive:  { type: Boolean,                      default: false },
  shiftLocked:  { type: Boolean,                      default: false }
});

const emit = defineEmits([
  'mousedown',
  'mouseup',
  'mouseenter',
  'mouseleave',
  'keypress'
]);

/**
 * keyTypeClass - Determina la clase CSS basada en el tipo de tecla
 * @returns Clase CSS correspondiente al tipo de tecla
 */
const keyTypeClass = computed(() => {
  if (!props.keyData.type || props.keyData.type === 'normal')  return '';
  const typeMap: Record<string, string> = {
    'shift': 'mayus-key shift-key',
    'special': 'special-key',
    'symbol': 'symbol-key',
    'emoji': 'emoji-key',
    'space': 'space-key',
    'enter': 'enter-key'
  };

  return typeMap[props.keyData.type] || '';
});

onMounted(() => {
    //añadimos un listener a la tecla actual para el evento touchmove para emular el evento touchenter y touchleave

    if (keyElement.value) {
        // Variable para rastrear si el dedo está dentro del elemento
        let isInside = false;

        keyElement.value.addEventListener('touchmove', (event: TouchEvent) => {
            event.preventDefault();
            const touch = event.touches[0];
            const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
            const isTouchInside = keyElement.value?.contains(elementUnderTouch) || elementUnderTouch === keyElement.value;

            // Manejar la clase 'hovered' para el efecto visual
            if (isTouchInside) {
                keyElement.value?.classList.add('hovered');
                emit('mouseenter', event, props.keyData);
            } else {
                keyElement.value?.classList.remove('hovered');
                emit('mouseleave', event, props.keyData);
            }
        }, { passive: false });

        keyElement.value.addEventListener('touchend', () => {
            keyElement.value?.classList.remove('hovered');
        });

        keyElement.value.addEventListener('touchcancel', () => {
            keyElement.value?.classList.remove('hovered');
        });
    }
});

onBeforeUnmount(() => {
    // Limpiar el listener cuando el componente se desmonte
    if (keyElement.value) {
        keyElement.value.removeEventListener('touchmove', () => {});
    }
});

/**
 * keyStyle - Calcula el estilo CSS basado en la posición de la tecla
 * @returns Objeto de estilo CSS
 */
const keyStyle = computed(() => (props.keyData.position)?{ 'align-items': props.keyData.position }:{});

/**
 * hasSpecialChars - Verifica si la tecla tiene caracteres especiales
 * @returns Verdadero si la tecla tiene caracteres especiales
 */
const hasSpecialChars = computed(() => {
  return !!props.keyData.special &&
         ((Array.isArray(props.keyData.special) && props.keyData.special.length > 0) ||
          (!Array.isArray(props.keyData.special) && props.keyData.special.length > 0));
});

/**
 * showMainChar - Determina si se debe mostrar el carácter principal
 * @returns Verdadero si se debe mostrar el carácter principal
 */
const showMainChar = computed(() => props.keyData.type !== 'shift' && props.keyData.type !== 'backspace' && props.keyData.type !== 'enter');

/**
 * displayChar - Determina el carácter a mostrar según el estado de Shift
 * @returns Carácter a mostrar
 */
const displayChar = computed(() => (props.keyData.upper && (props.shiftActive || props.shiftLocked))?props.keyData.upper:props.keyData.main || props.keyData.text || '');

/**
 * specialDisplay - Formatea los caracteres especiales para mostrarlos
 * @returns Texto formateado de caracteres especiales
 */
const specialDisplay = computed(() =>(props.keyData.super)?props.keyData.super:(Array.isArray(props.keyData.special))?props.keyData.special.join(' '):props.keyData.special || '');

/**
 * isShiftActive - Verifica si la tecla Shift está activa
 * @returns Verdadero si la tecla Shift está activa
 */
const isShiftActive = computed(() => props.keyData.type === 'shift' && props.shiftActive);

/**
 * isShiftLocked - Verifica si la tecla Shift está bloqueada
 * @returns Verdadero si la tecla Shift está bloqueada
 */
const isShiftLocked = computed(() => props.keyData.type === 'shift' && props.shiftLocked);

/**
 * text - Obtiene el texto de la tecla
 * @returns Texto de la tecla
 */
const text = computed(() => props.keyData.text || '');

/**
 * handleClick - Maneja el evento de clic en la tecla
 * Emite diferentes eventos según el tipo de tecla
 */
const handleClick = (event: MouseEvent) => {
  event.stopPropagation();
  
  // Si es una tecla especial, emitir su tipo directamente
  if (props.keyData.type && props.keyData.type !== 'normal') {
    emit('keypress', props.keyData.type);
    return;
  }

  // Para teclas normales, emitir el carácter principal
  if (props.keyData.main) {
    emit('keypress', props.keyData.main);
  }
};

/**
 * handleTouchStart - Maneja el inicio de un toque en la tecla
 * @param event - Evento de toque
 */
const handleTouchStart = (event: TouchEvent) => {
  if (!props.keyData.main) return;
  
  emit('mousedown', event, props.keyData.main, props.keyData.special);
};

/**
 * handleTouchEnd - Maneja el fin de un toque en la tecla
 * @param event - Evento de toque
 */
const handleTouchEnd = (event: TouchEvent) => {
  event.preventDefault();
  event.stopPropagation();

  // Solo emitir el evento mouseup, el padre decidirá qué hacer
  emit('mouseup', event);
};

/**
 * handleMouseDown - Maneja el inicio de un clic en la tecla
 * @param event - Evento de ratón
 */
const handleMouseDown = (event: MouseEvent) => {
  // Detener la propagación para evitar comportamientos no deseados
  event.stopPropagation();

  if (!props.keyData.main) return;

  // Emitir el evento para todas las teclas, independientemente de si tienen caracteres especiales
  if (hasSpecialChars.value) {
    emit('mousedown', event, props.keyData.main, props.keyData.special);
  } else {
    emit('mousedown', event, props.keyData.main);
  }
};

/**
 * handleMouseUp - Maneja el fin de un clic en la tecla
 * @param event - Evento de ratón
 */
const handleMouseUp = (event: MouseEvent) => {
  emit('mouseup', event);
};

/**
 * handleMouseEnter - Maneja cuando el cursor del mouse entra en la tecla
 * @param event - Evento de ratón
 */
const handleMouseEnter = (event: MouseEvent) => {
  // Detener la propagación para evitar comportamientos no deseados
  event.stopPropagation();

  // Emitir el evento con información de la tecla
  emit('mouseenter', event, props.keyData);
};

/**
 * handleMouseLeave - Maneja cuando el cursor del mouse sale de la tecla
 * @param event - Evento de ratón
 */
const handleMouseLeave = (event: MouseEvent) => {
  // Detener la propagación para evitar comportamientos no deseados
  event.stopPropagation();

  // Emitir el evento con información de la tecla
  emit('mouseleave', event, props.keyData);
};

/**
 * handleTouchEnter - Maneja cuando un dedo entra en la tecla en dispositivos táctiles
 * @param event - Evento de toque
 */
const handleTouchEnter = (event: TouchEvent) => {
  // Prevenir comportamiento por defecto y detener propagación
  event.preventDefault();
  event.stopPropagation();

  // Emitir el evento con información de la tecla
  emit('mouseenter', event, props.keyData);
};

/**
 * handleTouchLeave - Maneja cuando un dedo sale de la tecla en dispositivos táctiles
 * @param event - Evento de toque
 */
const handleTouchLeave = (event: TouchEvent) => {
  // Prevenir comportamiento por defecto y detener propagación
  event.preventDefault();
  event.stopPropagation();

  // Emitir el evento con información de la tecla
  emit('mouseleave', event, props.keyData);
};


</script>

<style scoped>
/* Estilos específicos para cuando se usa como emoji */
.key.emoji-item {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s ease;
}

.key.emoji-item:active {
  transform: scale(0.95);
}

/* Estilos específicos para cuando se usa como tecla especial */
.key.special-option-key {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.1s ease;
}

.key.special-option-key:hover,
.key.special-option-key.active,
.key.special-option-key.hovered {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
  transition: all 0.2s ease;
}

/* Estilos adicionales para el componente */
</style>