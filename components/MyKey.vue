<template>
  <div
    :class="keyClasses"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @touchstart="handleTouchEvents"
    @touchend="handleTouchEndEvent"
  >
    <span class="key-text" v-html="displayChar"></span>
    <span v-if="hasSpecialChars && superLength > 0" class="alt-char">
      {{ specialDisplay }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import type { KeyData } from '~/types';
import '~/css/components/MyKey.css';
import { useTouch } from '~/composables/useTouch';

const props = defineProps({
  keyData: {
    type: Object as () => KeyData,
    required: true
  },
  shiftActive: {
    type: Boolean,
    default: false
  },
  shiftLocked: {
    type: Boolean,
    default: false
  },
  backspaceIntervalTimeout: {
    type: Number,
    default: 500
  }
});

const emit = defineEmits(['mousedown', 'mouseup', 'mouseenter', 'mouseleave', 'keypress']);
const backspaceInterval = ref<number | null>(null);
const backspacesAmount = ref(0);
const backspaceIntervalTimeout = ref(props.backspaceIntervalTimeout);
const superLength = computed(() => {
  if (props.keyData.super) {
    return props.keyData.super.length;
  }
  return 1;
});
const { handleTouchStart, handleTouchEnd, isLongPress } = useTouch({
  longPressDelay: 500,
});

const handleTouchEndEvent = (event: TouchEvent) => {
  handleTouchEnd(event,{
    onTouchEnd: () => {
      stopBackspaceRepeat();
    }
  });
}

const hasSpecialChars = computed(() => {
  return Boolean(props.keyData.special && props.keyData.special.length > 0);
});
/**
 * specialDisplay - Formatea los caracteres especiales para mostrarlos
 * @returns Texto formateado de caracteres especiales
 */
 const specialDisplay = computed(() =>(props.keyData.super)?props.keyData.super:(Array.isArray(props.keyData.special))?props.keyData.special.join(' '):props.keyData.special || '');
const displayChar = computed(() => {
  //if (!props.keyData.main) return '';

  // Si hay un texto definido en el layout, usarlo
  if (props.keyData.text) {
    return props.keyData.text;
  }

  switch (props.keyData.type) {
    case 'backspace':
      return '⌫';
    case 'enter':
      return '⏎';
    case 'numeric':
      return '123';
    case 'punctuation':
      return '#+=';
    case 'letters':
      return 'ABC';
    case 'emoji':
      return '😊';
    case 'space':
      return '␣';
    default:
      if (!props.keyData.main) return '';
      if (props.shiftActive || props.shiftLocked) {
        return props.keyData.upper || props.keyData.main.toUpperCase();
      }
      return props.keyData.main;
  }
});

const keyClasses = computed(() => ({
  'key': true,
  'shift-key': props.keyData.type === 'shift',
  'shift-active': props.keyData.type === 'shift' && (props.shiftActive || props.shiftLocked),
  'shift-locked': props.keyData.type === 'shift' && props.shiftLocked,
  'special-chars': hasSpecialChars.value,
  'special-key': props.keyData.type === 'special',
  'numeric-key': props.keyData.type === 'numeric',
  'backspace-key': props.keyData.type === 'backspace',
  'enter-key': props.keyData.type === 'enter',
  'space-key': props.keyData.type === 'space',
  'emoji-key': props.keyData.type === 'emoji',
  'letters-key': props.keyData.type === 'letters',
  'punctuation-key': props.keyData.type === 'punctuation',
  'multi-char': hasSpecialChars.value
}));

const backspaceIntervalFunction = () => {
  if (backspaceInterval.value !== null) {
    backspacesAmount.value++;
    if ([3,5,7].includes(backspacesAmount.value)) {
      backspaceIntervalTimeout.value = Math.max((backspaceIntervalTimeout.value - 50), 0) + 1;
    }
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
  backspaceIntervalTimeout.value = props.backspaceIntervalTimeout;
};

const handleClick = (event: MouseEvent) => {
  event.stopPropagation();

  if (props.keyData.type && props.keyData.type !== 'normal') {
    emit('keypress', props.keyData.type);
    return;
  }

  if (props.keyData.main) {
    emit('keypress', props.keyData.main);
  }
};

const handleTouchEvents = (event: TouchEvent) => {
  event.preventDefault();
  if (props.keyData.type === 'backspace') {
    startBackspaceRepeat();
  }

  handleTouchStart(event, {
    onTap: () => handleClick(event as unknown as MouseEvent),
    onLongPress: () => {
      if (hasSpecialChars.value) {
        emit('mousedown', event, props.keyData.main, props.keyData.special);
      }
    }
  });
};

const handleMouseDown = (event: MouseEvent) => {
  event.stopPropagation();

  if (props.keyData.type === 'backspace') {
    startBackspaceRepeat();
  }

  if (!props.keyData.main) return;

  if (hasSpecialChars.value) {
    emit('mousedown', event, props.keyData.main, props.keyData.special);
  }
};

const handleMouseUp = (event: MouseEvent) => {
  stopBackspaceRepeat();
  emit('mouseup', event);
};

const handleMouseEnter = (event: MouseEvent) => {
  event.stopPropagation();
  emit('mouseenter', event, props.keyData);
};

const handleMouseLeave = (event: MouseEvent) => {
  stopBackspaceRepeat();
  event.stopPropagation();
  emit('mouseleave', event, props.keyData);
};

onBeforeUnmount(() => {
  stopBackspaceRepeat();
});

defineExpose({
  selectOption: handleClick,
  toggleDropdown: handleMouseDown,
  closeDropdown: handleMouseUp,
  openDropdown: handleMouseEnter,
  selectedOption: handleMouseLeave
});
</script>