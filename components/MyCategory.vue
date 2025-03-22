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

  <style scoped>
  .my-category-container {
    background-color: #bcb9b9;
    margin-inline-end:  .125rem;
    padding:            .625rem;
    width:              fit-content;
  }
  .my-category {
    border:             .0625rem solid black;
    cursor:             pointer;
    height:             5rem;
    overflow:           visible;
    padding:            1.25rem;
    position:           relative;
    width:              5rem;
  }
  .category-title {
    background-color: rgba(0, 0, 0, 0.5);
    color:            #fff;
    display:            none;
    left:               50%;
    max-width:          18.75rem;
    overflow:           visible ;
    padding:            .625rem;
    position:           absolute;
    top:                50%;
    transform:          translate(-50%, -50%);
    user-select:        none;
    white-space:        nowrap;
    z-index:            1000;
    text-align:         center;
  }
  .category-title.active {
    display:            block;
  }
  .selected {
    background-color: #fff;
    box-shadow:         0 0 .3125rem #000;
  }
  </style>