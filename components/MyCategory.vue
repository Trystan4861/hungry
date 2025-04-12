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
    import { useTouch } from '~/composables/useTouch';

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

    const emit            = defineEmits(['categoryClick','categoryLongClick']);
    const esActivo        = ref(props.isActive);

    const { handleTouchStart, handleTouchEnd, isLongPress } = useTouch({
      longPressDelay: props.longClickTimeout
    });

    const handleClick     = () => {
      if (!isLongPress.value) {
        emit('categoryClick');
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        event.preventDefault();
        handleTouchStart(event as unknown as TouchEvent, {
          onLongPress: () => {
            if (esActivo.value) {
              emit('categoryLongClick');
            }
          }
        });
      }
    };

    const handlePointerUp   = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        handleTouchEnd(event as unknown as TouchEvent);
      }
    };

    watch(()=>props.isActive, newValue => {
      esActivo.value = newValue;
    });
  </script>

