<template>
    <div class="my-category-container" :class="{ 'selected': isActive }">
      <div class="my-category" :style="{ backgroundColor: bgColor }"
        @click="handleClick"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp">
        <p class="category-title" :class="{active: isActive}" v-html="text.replaceAll('/','<br />')"/>
      </div>
    </div>
  </template>

  <script lang="ts" setup>
    import { ref, watch } from 'vue';
    import '~/css/components/MyCategory.css';

    interface Props {
      text:             string;
      bgColor:          string;
      isActive:         boolean;
      longClickTimeout: number;
    }
    const props: Props = defineProps({
      text:             { type: String,   default: ""           },
      bgColor:          { type: String,   default: 'lightgray'  },
      isActive:         { type: Boolean,  default: false        },
      longClickTimeout: { type: Number,   default: 2000         },
    });

    let longPressTimeout: ReturnType<typeof setTimeout> | null = null;
    let wasLongClick: boolean = false;
    const esActivo        = ref(props.isActive)
    const emit            = defineEmits(['categoryClick','categoryLongClick']);
    const handleClick     = () => {
      if (!wasLongClick) {
        emit('categoryClick');
      }
      wasLongClick = false; // Reset for next click
    };
    const handlePointerDown = (event: PointerEvent) => {
      wasLongClick = false;
      if (event.pointerType === 'touch') {
        event.preventDefault(); // Prevent scrolling on touch devices
      }
      esActivo.value ? longPressTimeout = setTimeout(() => {
        wasLongClick = true;
        emit('categoryLongClick');
      }, props.longClickTimeout) : undefined;
    };
    const handlePointerUp   = (event: PointerEvent) => {
      if (esActivo.value && longPressTimeout) {
        clearTimeout(longPressTimeout);
      }
    };
    watch(()=>props.isActive,newValue=>{esActivo.value=newValue; (!newValue && longPressTimeout && clearTimeout(longPressTimeout))})
  </script>

