<template>
  <div class="my-product"
    @contextmenu.prevent
    :data-supermercado="product.id_supermercado"
    :data-categoria="product.id_categoria"
    v-touch:tap="handleTap"
    v-touch:press="handlePress"
    v-touch:release="handleRelease"
    v-touch:drag.once="handleDrag"
    >
    <span :style="{ backgroundColor: bgColor }" class="productCategory" />
    <div class="product" :class="{ selected: product.selected, done: product.done && canBeDone }">
      <p :style="{ display: product.selected ? 'block' : 'none' }" class="productAmount">{{ product.amount || 1 }}&nbsp;</p>
      <p class="productText">{{ product.text }}</p>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'MyProduct',
  props: {
    product: {
      type: Object,
      required: true
    },
    canBeDone: {
      type: Boolean,
      default: false
    },
    longClickTime:{
      type: Number,
      default: 1000
    },
    dragTime:{
      type: Number,
      default: 500
    },
  },
  computed: {
    bgColor(){
      let categoria=this.storeGet.getCategoriaFromID(this.product.id_categoria)
      return categoria?.bgColor || "#fff"
    },
  },
  setup(props, { emit }) {
    const store=useStore()
    const storeGet=store.getters;
    const longPressTimeout = ref(null);
    const longClicked = ref(false);
    const dragInterval=ref(props.dragTime)
    const dragDirection=ref(null)
    const ignoreDrag=ref(storeGet.getIgnoreDrag)
    let dragging = false;
    let touchStartX = null;
    const tiempoDrag = 500; // Milisegundos para considerar un drag

    const handleTap = () => {
      if (!longClicked.value)
        emit('product:click', props.product);
      else
        longClicked.value = false;
    };
    const handlePress = () => {
      if (props.canBeDone || dragging || props.product.selected) return;
      longClicked.value = false;
      longPressTimeout.value = setTimeout(() => {longClicked.value = true;emit('product:longClick', props.product);}, props.longClickTime);
    };

    const handleRelease = () => {
      clearTimeout(longPressTimeout.value);
      emitDragEnd()
    };

    const handleDrag = (event) => {
      if (ignoreDrag.value) return
      if (!props.product.selected) return
      dragDirection.value = touchStartX !== null ? (event.touches[0].clientX > touchStartX ? 'right' : 'left') : null;
      if (props.canBeDone || dragging) return;
      longClicked.value = false;
      clearTimeout(longPressTimeout.value);
      touchStartX = event.touches[0].clientX;
      dragging=true
      emitDragStart();
    };
    watch(() => storeGet.getIgnoreDrag(), (nuevoValor) => {
      ignoreDrag.value = nuevoValor;
    });
    const emitDragEnd=()=>{
      clearInterval(dragInterval.value)
      dragging = false;
    }
    const emitDragStart = () => {
      dragging=true;
      dragInterval.value = setInterval(() => {
        emitDragDirection();
      }, tiempoDrag);
    };

    const emitDragDirection = () => {
      if (!props.product.selected) emitDragEnd()
      emit(`product:drag.${dragDirection.value}`,props.product)
      emit('product:drag', dragDirection.value,props.product);
    };

    return {
      handleTap,
      handleRelease,
      handleDrag,
      handlePress,
      storeGet,
      ignoreDrag
    };
  },
  emits: ['product:click', 'product:longClick', 'product:drag','product:drag.left','product:drag.right']
};
</script>

<style scoped>
.productCategory {
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
.product {
  display: flex;
  padding-left: .625rem;
}
.selected {
  font-weight: bold;
}
.done {
  text-decoration: line-through;
}
span {
  position: relative;
  left: -0.3125rem;
}
</style>
