<template>
  <div class="my-product"
    @contextmenu.prevent
    :data-supermercado="product.id_supermercado"
    :data-categoria="product.id_categoria"
    :data-index="index"
    v-touch:tap="handleTap"
    v-touch:press="handlePress"
    v-touch:release="handleRelease"
    v-touch:drag.once="handleDrag"
    >
    <span :style="{ backgroundColor: bgColor }" class="productCategory" />
    <div class="product" :class="{ selected: product.selected, done: product.done && canBeDone }">
      <div :style="{ display: product.selected ? 'block' : 'none' }" class="productAmount">{{ cantidad }}&nbsp;</div>
      <div class="productText">{{ product.text }}</div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted, computed } from 'vue';
  import { useStore } from 'vuex';

  const props             = defineProps({
    canBeDone:      { type: Boolean,  default:  false },
    dragTime:       { type: Number,   default:  500   },
    index:          { type: Number,   default:  null  },
    longClickTime:  { type: Number,   default:  2000  },
    product:        { type: Object,   required: true  },
    amount:         { type: Number,   default:  1     },
  });

  const dragDirection     = ref(null);
  const dragInterval      = ref(props.dragTime);
  const ignoreDrag        = ref(false);
  const longClicked       = ref(false);
  const longPressTimeout  = ref(null);
  const tiempoDrag        = 500;
  const store             = useStore();

  let dragging            = false;
  let touchStartX         = null;
  let storeGet            = store.getters;

  const cantidad          = computed(()=>{return props.amount})
  const handleTap         = () => !longClicked.value ? emit('click', props.product) : longClicked.value = false;

  const bgColor = computed(() => {
    let categoria = storeGet.getCategoriaFromID(props.product.id_categoria);
    return categoria.bgColor ?? "#fff";
  });

  const handlePress       = () => {
    if (props.canBeDone || dragging || props.product.selected) return;
    longClicked.value = false;
    longPressTimeout.value = setTimeout(() => { longClicked.value = true; emit('longClick', props.product); setTimeout(()=>longClicked.value=false,1000)}, props.longClickTime);
  };
  watch(() => props.amount, (newValue) => newValue < 0?cantidad.value = 0:undefined);

  const handleRelease     = () => (clearTimeout(longPressTimeout.value), dragEnd());

  const handleDrag        = event => {
    if (event.type=='mousemove') return;
    if (ignoreDrag.value || !props.product.selected) return;
    dragDirection.value = touchStartX !== null ? (event.touches[0].clientX > touchStartX ? 'right' : 'left') : null;
    if (props.canBeDone || dragging) return;
    longClicked.value = false;
    clearTimeout(longPressTimeout.value);
    touchStartX = event.touches[0].clientX;
    dragging = true;
    dragStart();
  };


  const dragEnd       = () => (clearInterval(dragInterval.value),dragging = false)
  const dragStart     = () => (dragging = true,dragInterval.value = setInterval(emitDragDirection, tiempoDrag))

  const emitDragDirection = () => {
    if (!props.product.selected) dragEnd();
    emit(`drag.${dragDirection.value}`, props.product);
    emit('drag', dragDirection.value, props.product);
  };
  const emit=defineEmits([
    'click',
    'drag',
    'drag.left',
    'drag.right',
    'longClick',
  ])

  watch(() => storeGet.getIgnoreDrag(), (newValue) => ignoreDrag.value = newValue);

  onMounted(() => {
    ignoreDrag.value = storeGet.getIgnoreDrag()
  });
</script>

<style scoped>
.productCategory {
  height:           1.5625rem;
  width:            1.5625rem;
}
.my-product {
  cursor:           pointer;
  display:          flex;
  height:           1.875rem;
  margin-bottom:    1px;
  user-select:      none;
  width:            100%;
}
.product {
  display:          flex;
  padding-left:     .625rem;
}
.selected {
  font-weight:      bold;
}
.done {
  text-decoration:  line-through;
}
span {
  left:             -0.3125rem;
  position:         relative;
}
</style>
