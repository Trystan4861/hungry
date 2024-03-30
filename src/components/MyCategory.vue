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
.my-category-container{
    background-color: #bcb9b9;
    margin-inline-end:  .125rem;
    padding:            .625rem;
}
.my-category{
    border:             .0625rem solid black;
    cursor:             pointer;
    height:             5rem;
    overflow:           visible; 
    padding:            1.25rem;
    position:           relative;
    width:              5rem;
}
.category-title{
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
}
.category-title.active{
    display:            block;
}
.selected {
    background-color: #fff;
    box-shadow:         0 0 .3125rem #000;
}
</style>