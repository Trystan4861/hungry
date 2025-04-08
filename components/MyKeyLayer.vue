<template>
  <div v-if="show"
       class="special-keys-layer"
        :style="{ width: `${width}px`,top:`${top}px`, left: `${left}px` }"
       @mouseleave="handleMouseLeave">
    <div class="special-keys-container">
      <MyKey
        v-for="(key, index) in specialKeys"
        :key="index"
        :key-data="{
          main: key,
          type: 'normal',
          position: 'center'
        }"
        :class="{ 'active': currentIndex === index }"
        :data-index="index"
        @mouseenter="currentIndex = index"
        @mouseup="handleKeySelect(key)"
        @touchstart.prevent="handleTouchStart($event, index)"
        @touchend.prevent="handleTouchEnd($event, key)"
        @keypress="(key) => handleKeySelect(key)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getCssVar, toPixels } from '~/utils/cssVars';
import MyKey from './MyKey.vue';
import '~/css/components/MyKeyLayer.css';

const props = defineProps({
  show: { type: Boolean, required: true },
  parent: { type: [Object, null] as PropType<HTMLElement | null>, required: false, default: null },
  specialKeys: { type: Array as () => string[], required: true },
});

const emit = defineEmits(['select', 'mouseleave', 'update:show']);

const currentIndex = ref(-1);

const width = computed(() => {
    // Calcular el ancho total de los keys basado en el número de keys y en la resolución de la pantalla
    // teniendo en cuenta el tamaño de cada key según el listado siguiente para cada resolución
    //@media (min-width: 769px) 2.5rem;
    //@media (max-width: 768px)  2rem;
    //@media (max-width: 480px) 1.8rem;
    //@media (max-width: 360px)  1.6rem;
    const screenWidth = window.innerWidth;
    let keyWidth = toPixels(getCssVar('key-size'));
    let layerPadding = toPixels(getCssVar('keys-layer-padding'));

    // Calcular el ancho total basado en el número de teclas especiales
    return props.specialKeys.length * (keyWidth) + layerPadding*2;
  });

const top = computed(() => {
  // Calcular la posición superior del layer basado en la posición del parent
  if (props.parent) {
    const parentRect = props.parent.getBoundingClientRect();
    let top = parentRect.top + window.scrollY + toPixels(getCssVar('key-size'))/2 - (toPixels(getCssVar('keys-layer-padding'))*4);
    // Si el layer se sale de la pantalla, moverlo hacia abajo el espacio que sobresalga de la pantalla
    if (top < 0) {
      top += Math.abs(top)+4;
    }
    else if (top + toPixels(getCssVar('key-size')) > window.innerHeight) {
      top -= Math.abs(window.innerHeight-top-toPixels(getCssVar('key-size')))+4;
    }
    return top;
  }
  return 0;
});

const left = computed(() => {
  // Calcular la posición izquierda del layer basado en la posición del parent
  if (props.parent) {
    const parentRect = props.parent.getBoundingClientRect();
    // Calcular la posición izquierda del layer basado en la posición del parent, centrando el layer sobre él
    // y restando el ancho del layer dividido por 2
    // y el padding del layer
    // y si el layer se sale de la pantalla, moverlo hacia el otro lado de la pantalla el espacio que sobresalga de la pantalla

    let left= parentRect.left + window.scrollX+ toPixels(getCssVar('key-size')) - (width.value/2)-toPixels(getCssVar('keys-layer-padding'))*2-4;
    if (left < 0) {
      left = 10;
    }
    else if (left + width.value > window.innerWidth) {
      left = window.innerWidth - width.value - 10;
    }
    return left;
  }
  return 0;
});

const handleMouseLeave = () => {
  emit('mouseleave');
  emit('update:show', false);
  currentIndex.value = -1;
};

const handleKeySelect = (key: string) => {
  emit('select', key);
  emit('update:show', false);
  currentIndex.value = -1;
};

const handleTouchStart = (event: TouchEvent, index: number) => {
  event.preventDefault();
  currentIndex.value = index;
};

const handleTouchEnd = (event: TouchEvent, key: string) => {
  event.preventDefault();
  if (currentIndex.value >= 0) {
    handleKeySelect(key);
  }
};

// Resetear el índice cuando se oculta el layer
watch(() => props.show, (newValue) => {
  if (!newValue) {
    currentIndex.value = -1;
  }
});
</script>