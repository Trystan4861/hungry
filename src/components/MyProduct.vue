<template>
  <div class="my-product"
    @contextmenu.prevent
    :data-supermercado="product.id_supermercado"
    :data-categoria="product.id_categoria"
    :data-index="index"
    >
    <span :style="{ backgroundColor: bgColor }" class="productCategory" @click="emit('categoryClick',props.product)" />
    <div class="product" :class="{ selected: product.selected, done: product.done && canBeDone }">
      <div class="productAmount" :style="{ display: product.selected ? 'block' : 'none' }">{{ cantidad }}</div>
      <div class="productText"
      v-touch:tap="handleTap"
      v-touch:press="handlePress"
      v-touch:release="handleRelease"
      v-touch:drag.once="handleDrag"
      v-html="nombreProducto"></div>
      <div :style="{ display: product.selected && !props.canBeDone? 'block' : 'none' }" class="plus" @click.stop="plus">➕</div>
      <div :style="{ display: product.selected && !props.canBeDone? 'block' : 'none' }" class="minus" @click.stop="minus"><div v-if="product.amount>1">➖</div><div v-else class="rotate-45">➕</div></div>
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
  const storeGet          = store.getters;

  let dragging            = false;
  let touchStartX         = null;

  const nombreProducto    = computed(() => {
    // eslint-disable-next-line
    const emojiRegex = /([\u{203C}\u{2049}\u{20E3}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{231B}\u{23E9}-\u{23EC}\u{23F0}\u{23F3}\u{24C2}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2601}\u{260E}\u{2611}\u{2614}-\u{2615}\u{261D}\u{263A}\u{2648}-\u{2653}\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267F}\u{2693}\u{26A0}-\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270C}\u{270F}\u{2712}\u{2714}\u{2716}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{1F004}\u{1F0CF}\u{1F201}-\u{1F202}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F23A}\u{1F250}-\u{1F251}\u{1F300}-\u{1F320}\u{1F330}-\u{1F335}\u{1F337}-\u{1F37C}\u{1F380}-\u{1F393}\u{1F3A0}-\u{1F3C4}\u{1F3C6}-\u{1F3CA}\u{1F3E0}-\u{1F3F0}\u{1F400}-\u{1F43E}\u{1F440}\u{1F442}-\u{1F4F7}\u{1F4F9}-\u{1F4FC}\u{1F500}-\u{1F507}\u{1F509}-\u{1F53D}\u{1F550}-\u{1F567}\u{1F5FB}-\u{1F640}\u{1F645}-\u{1F64F}\u{1F680}-\u{1F68A}\u{1FA00}-\u{1FAFF}])/gu;
    return props.product.text.replace(emojiRegex, '<span class="emoji">$1</span>');
  });

  const cantidad          = computed(() => props.amount);
  const handleTap         = () => !longClicked.value ? emit('click', props.product) : longClicked.value = false;

  const bgColor           = computed(() => storeGet.getCategoriaFromID(props.product.id_categoria).bgColor ?? "#fff");
  const handlePress       = () => {
    if (props.canBeDone || dragging || props.product.selected) return;
    longClicked.value = false;
    longPressTimeout.value = setTimeout(() => { longClicked.value = true; emit('longClick', props.product); setTimeout(()=>longClicked.value=false,1000)}, props.longClickTime);
  };
    
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
  
  const dragEnd           = () => (clearInterval(dragInterval.value),dragging = false)
  const dragStart         = () => (dragging = true,dragInterval.value = setInterval(emitDragDirection, tiempoDrag))
  
  const plus              = ()=> doDrag('right')
  const minus              = ()=> doDrag('left')
  const doDrag            = direction =>{
    dragDirection.value=direction;
    emitDragDirection();
    dragDirection.value=null;
  }

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
    'categoryClick',
  ])
  
  watch(()                => props.amount,              newValue => newValue < 0?(cantidad.value = 0):undefined);
  watch(()                => storeGet.getIgnoreDrag(),  newValue => ignoreDrag.value = newValue);
  onMounted(()            => ignoreDrag.value = storeGet.getIgnoreDrag());
</script>

<style scoped>
.productCategory {
  height:           1.5625rem;
  width:            1.5625rem;
  margin-top:       1px;
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
  width: 100%;
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
.productAmount{
  margin-right:2px;
}

.productText{
  width: 100%;
}
.plus{
  position: relative;
  padding-left:5px;
  padding-right: 5px;
}
.minus{
  position: relative;
  margin-right:15px;
  padding-left:10px;
}
.rotate-45
{
  transform: rotate(45deg);
  transform-origin: center;
}
.emoji {
  font-family: 'Noto Color Emoji', 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif;
}
</style>
