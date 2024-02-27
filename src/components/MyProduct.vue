<template>
  <div class="my-product" 
    :data-supermercado="product.id_supermercado" 
    :data-categoria="product.id_categoria" 
    @click="handleClick"
    @mousedown="handleMouseDown" @mouseup="handleMouseUp" 
    @touchstart="handleMouseDown" @touchend="handleMouseUp"
  >
    <span  :style="{ backgroundColor: product.categoria?.bgColor || '#FFF' }" class="productCategory" />
    <div class="product" :class="{selected: product.selected, done: product.done && canBeDone}">
      <p :style="{display: product.selected ? 'block' : 'none'}" class="productAmount">{{ product.amount || 1 }}&nbsp;</p>
      <p class="productText">{{ product.text }}</p>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue';
export default {
  name: 'MyProduct',
  props: {
    product: {
      type: Object,
      required: true
    },
    canBeDone:{
      type:Boolean,
      default: false
    }
  },
  setup(props,{emit}){
    const longPressTimeout = ref(null);
    const longClicked = ref(false);

    const handleClick = () => {
      if (!longClicked.value)
        emit('click:product', props.product);
      else
        longClicked.value = false;
    };

    const handleMouseDown = () => {
      if (props.canBeDone) return;
      longClicked.value = false; // Reinicia longClicked a falso al comenzar el clic
      longPressTimeout.value = setTimeout(() => {
        longClicked.value = true; // Establece longClicked a verdadero si se mantiene pulsado
        emit('longClick:product', props.product);
      }, 1000); 
    };

    const handleMouseUp = () => {
      clearTimeout(longPressTimeout.value);
    };

    return {
      handleClick,
      handleMouseDown,
      handleMouseUp
    };
  },
  emits:['click:product','longClick:product']
};
</script>

<style scoped>
.productCategory{
  width: 1.5625rem;
  height: 1.5625rem;
}
.my-product {
  width: 100%;
  height: 1.875rem;
  display: flex;
  cursor: pointer;
  user-select: none;
}
.product{
  display: flex;
  padding-left: .625rem;
}
.selected{
  font-weight: bold;
}
.done{
  text-decoration: line-through;
}
span{
  position: relative;
  left: -0.3125rem
}
</style>
