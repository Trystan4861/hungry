<template>
    <div class="my-category-container" :class="{ 'selected': isActive }">
        <div class="my-category" :style="{ backgroundColor: bgColor }" 
        @click="handleClick"  
        @mousedown ="handleMouseDown" @mouseup ="handleMouseUp" 
        @touchstart="handleMouseDown" @touchend="handleMouseUp">
            <p class="category-title" :class="{active: isActive}">{{ text }}</p>
        </div>
    </div>
</template>
  
<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  text:     { type: String,  default: ""          },
  bgColor:  { type: String,  default: 'lightgray' },
  isActive: { type: Boolean, default: false       }
});

let longPressTimeout  = null;
const emit = defineEmits(['categoryClick','categoryLongClick']);

const handleClick = () => emit('categoryClick');
const handleMouseDown = () => props.isActive ? longPressTimeout = setTimeout(() => emit('categoryLongClick'), 1000) : undefined;
const handleMouseUp = () => props.isActive ? clearTimeout(longPressTimeout) : undefined;
</script>


<style scoped>
    @import url('@css/MyCategory.vue.css');
</style>