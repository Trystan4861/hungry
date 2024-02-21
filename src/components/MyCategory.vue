<template>
    <div class="my-category-container" :class="{ 'selected': isActive }">
        <div class="my-category" :style="{ backgroundColor: bgColor }" 
        @click="handleClick"  
        @mousedown="handleMouseDown" @mouseup="handleMouseUp" 
        @touchstart="handleMouseDown" @touchend="handleMouseUp">
            <p class="category-title" :class="{active: isActive}">{{ text }}</p>
        </div>
    </div>
</template>
  
<script>
    import { ref } from 'vue';
    export default {
        name: 'MyCategory',
        props: {
            text: {
                type: String,
                default: ""
            },
            bgColor: {
                type: String,
                default: 'lightgray'
            },
            isActive:{
                type: Boolean,
                default: false
            }
        },
        setup(props, { emit }) {
            const longPressTimeout = ref(null);
            const handleClick = () => {
                emit('categoryClick');
            };

            const handleMouseDown = () => {
                if (props.isActive)
                longPressTimeout.value = setTimeout(() => {
                    emit('categoryLongClick');
                }, 1000); 
            };

            const handleMouseUp = () => {
                if (props.isActive)
                clearTimeout(longPressTimeout.value);
            };

            return {
                handleClick,
                handleMouseDown,
                handleMouseUp
            };
        }
    };
</script>

<style scoped>
.my-category-container
{
    background-color: #bcb9b9;
    padding: .625rem;
    margin-inline-end: .125rem;
}
.my-category {
    cursor: pointer;
    padding: 1.25rem;
    border: .0625rem solid black;
    height: 5rem;
    width: 5rem;
    position: relative;
    overflow: visible; /* Ocultar el contenido que desborde */}
.category-title
{
    user-select: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.5); /* Color de fondo del tooltip */
    color: #fff; /* Color de texto del tooltip */
    padding: .625rem; /* Espaciado interno del tooltip */
    max-width: 18.75rem; /* Ancho máximo del tooltip */
    z-index: 1000; /* Z-index para que esté por encima de otros elementos */
    white-space: nowrap; /* Evitar que el texto se divida en varias líneas */
    overflow:visible ; /* Ocultar el texto que desborde */
    display: none; /* Agregar puntos suspensivos al texto que desborde */
}
.category-title.active
{
    display: block;
}
.selected {
  /* Estilos cuando está seleccionado */
  box-shadow: 0 0 .3125rem #000;
  background-color: #fff; /* Borde distintivo */
}
</style>