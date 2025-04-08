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
    @mousedown.stop="handleMouseDown"
    @mouseup.stop="handleMouseUp"
    @mouseenter.stop="handleMouseEnter"
    @mouseleave.stop="handleMouseLeave"
    @touchstart.stop.prevent="handleTouchStart"
    @touchend.stop.prevent="handleTouchEnd"
  >
    <span v-if="showMainChar" class="main-char">
      {{ displayChar }}
    </span>
    <span v-if="hasSpecialChars && superLength > 0" class="alt-char">
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
import '~/css/components/MyKey.css';
/**
 * keyElement - Referencia al elemento div.key
 * Permite acceder al elemento DOM de la tecla actual desde cualquier parte del componente
 */
const keyElement = ref<HTMLDivElement | null>(null);

const props = defineProps({
  keyData:      { type: Object as PropType<KeyData>,  required: true },
  shiftActive:  { type: Boolean,                      default: false },
  shiftLocked:  { type: Boolean,                      default: false },
  backspaceIntervalTimeout: { type: Number,           default: 200 },

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
    'shift': 'shift-key',
    'special': 'special-key',
    'punctuation': 'punctuation-key',
    'numeric': 'numeric-key',
    'emoji': 'emoji-key',
    'space': 'space-key',
    'enter': 'enter-key',
    'letters': 'letters-key',
    'backspace': 'backspace-key',
  };

  return typeMap[props.keyData.type] || '';
});

const superLength = computed(() => {
  if (props.keyData.super) {
    return props.keyData.super.length;
  }
  return 1;
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
  return !!props.keyData.special && props.keyData.special.length > 0;
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

const backspacesAmount = ref<number>(0);
const backspaceInterval = ref<number | null>(null);
const backspaceIntervalTimeout = ref<number>(props.backspaceIntervalTimeout);

const backspaceIntervalFunction = () => {
  if (props.keyData.type === 'backspace') {
    backspacesAmount.value++;
    if ([3,5,7].includes(backspacesAmount.value)) backspaceIntervalTimeout.value = Math.max((backspaceIntervalTimeout.value - 50), 0) + 1;
    emit('keypress', 'backspace');
  }
  startBackspaceRepeat();
};

const startBackspaceRepeat = () => {
  if (props.keyData.type === 'backspace') {
    backspaceInterval.value = window.setTimeout(backspaceIntervalFunction, backspaceIntervalTimeout.value);
  }
};

const stopBackspaceRepeat = () => {
  if (backspaceInterval.value !== null) {
    window.clearTimeout(backspaceInterval.value);
    backspaceInterval.value = null;
  }
  backspacesAmount.value = 0;
  backspaceIntervalTimeout.value=props.backspaceIntervalTimeout;
};

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
  if (props.keyData.type === 'backspace') {
    startBackspaceRepeat();
  }

  if (!props.keyData.main) return;

  // Solo emitir mousedown si hay caracteres especiales
  if (hasSpecialChars.value) {
    emit('mousedown', event, props.keyData.main, props.keyData.special);
  }
};

/**
 * handleTouchEnd - Maneja el fin de un toque en la tecla
 * @param event - Evento de toque
 */
const handleTouchEnd = (event: TouchEvent) => {
  event.preventDefault();
  event.stopPropagation();

  stopBackspaceRepeat();

  // Si hay un longpress timer activo, significa que estamos en proceso de mostrar caracteres especiales
  const isLongPressActive = document.querySelector('.special-keys-layer');

  // Si no hay layer de caracteres especiales visible, emitir click
  if (!isLongPressActive) {
    handleClick(new MouseEvent('click'));
    return;
  }

  // Si hay layer visible, emitir mouseup para que el padre maneje la selección
  emit('mouseup', event);
};

/**
 * handleMouseDown - Maneja el inicio de un clic en la tecla
 * @param event - Evento de ratón
 */
const handleMouseDown = (event: MouseEvent) => {
  // Detener la propagación para evitar comportamientos no deseados
  event.stopPropagation();

  if (props.keyData.type === 'backspace') {
    startBackspaceRepeat();
  }

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
  stopBackspaceRepeat();
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

onBeforeUnmount(() => {
  stopBackspaceRepeat();
});
</script>