<template>
  <div class="my-categories-list-container" ref="containerRef" @scroll="handleScroll">
    <div class="leftShadow shadow" />
    <div class="rightShadow shadow" />
    <div class="categories-padding">
      <div class="my-categories-list" :style="categoryListStyle">
        <MyCategory
          v-for="(category, index) in visibleCategories"
          :key="category.id"
          :text="category.text"
          :bgColor="category.bgColor"
          @categoryClick="handleCategoryClick(index)"
          @categoryLongClick="handleCategoryLongClick(index)"
          :isActive="index === selected" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import MyCategory from '@components/MyCategory.vue'
import { useStore } from 'vuex';

const props = defineProps({
//  categories: { type: Array, required: true },
  selected: { type: Number, default: 0 }
});

const emit = defineEmits(['categorySelected', 'categoryLongClick']);

const store=useStore()
const storeGet=store.getters
const categories=computed(()=>storeGet.getCategorias())
const selected = ref(props.selected);
const activeCategory = ref({});
const categoriesState = ref({});
const containerRef = ref(null);
const observer = ref(null);
let lastCategory = null;
const categoryListStyle = ref({});

categoriesState.value[0] = true;

const seleccionarCategoria = (id_categoria) => {
  const index = categories.value.findIndex(categoria => categoria.id === id_categoria);
  activeCategory.value = categories.value[index];
  selected.value = index;
};

const centrarCategoriaActiva = () => {
  scrollIntoView(selected.value, 'instant');
};

const handleCategoryClick = (index) => {
  if (lastCategory == index) return;
  selected.value = lastCategory = index;
  scrollIntoView(index, 'instant');
  emit('categorySelected', categories.value[index]);
};

const handleCategoryLongClick = (index) => {
  selected.value = index;
  scrollIntoView(index, 'instant');
  emit('categoryLongClick', categories.value[index]);
};

watch(selected, (newValue, oldValue) => {
  oldValue !== null && (categoriesState.value[oldValue] = false);
  newValue !== null && (categoriesState.value[newValue] = true, activeCategory.value = categories.value[newValue]);
});
watch(()=>props.selected,newValue=>seleccionarCategoria(newValue))

const visibleCategories = computed(() => categories.value.filter(category => Boolean(category.visible) === true));

const handleScroll = () => {
  const container = containerRef.value;
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  const categoriesContainer = container.querySelectorAll('.my-category');

  let closestCategory = null;
  let minDistance = Infinity;

  categoriesContainer.forEach((category) => {
    const categoryRect = category.getBoundingClientRect();
    const categoryCenter = categoryRect.left + categoryRect.width / 2;
    const distance = Math.abs(containerCenter - categoryCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestCategory = category;
    }
  });
  const index = Array.from(container.querySelectorAll('.my-category')).indexOf(closestCategory);
  if (lastCategory != index) {
    selected.value = lastCategory = index;
    emit('categorySelected', categories.value[index]);
  }
};

const scrollIntoView = (index, behavior = 'smooth') => {
  containerRef.value?.querySelectorAll('.my-category')[index]?.scrollIntoView({ behavior, block: 'center', inline: 'center' });
};

const doResize = () => {
  const container = containerRef.value;
  if (!container) return;

  const parent=container.parentElement
  const parentS= window.getComputedStyle(parent)
  const parentCR=parent.getClientRects()
  parentCR[0]?.width && parent.style.setProperty('--ancho-after', `calc( ${parentCR[0].width}px - ${parentS.paddingLeft} - ${parentS.paddingRight})`);

  const plr = (container?.clientWidth - container.querySelector('.my-category')?.clientWidth) / 2;
  categoryListStyle.value = { left: `${plr}px`, paddingRight: `${plr}px` };
  if (selected.value >= 0) setTimeout(centrarCategoriaActiva, 1);
};

onMounted(() => {
  //selected.value = props.selected;
  seleccionarCategoria(selected.value);
  window.addEventListener('resize', doResize, { passive: true });
  observer.value = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && doResize()));
  observer.value.observe(containerRef.value);
  emit('categorySelected', categories.value[0]);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', doResize);
  observer.value && observer.value.disconnect();
});

defineExpose({seleccionarCategoria,selected})

</script>

<style scoped>
.shadow {
  top:                10px;
  position:           absolute;
  user-select:        none; 
  z-index:            100;
  width:              25px;
  clip-path:          border-box;
  height:             107px;
}
.leftShadow {
  background-image: url('@/public/images/box-shadow-left.png');
  top:                10px;
  background-position: right;
}
.rightShadow {
  background-image: url('@/public/images/box-shadow-right.png');
  background-position: left;
  right:              0px;
  margin-right:       10px
}
.swal .shadow {
  top:                0px;
  z-index:            1;
}
.swal .leftShadow {
    left:             29px;
    top:              95px;
}
.swal .rightShadow {
  right:              19px;
  top:                95px;
}

.my-categories-list-container {
  align-items:        center;
  background-color: #585858;
  display:            flex;
  height:             6.875rem;
  overflow-x:         scroll;
  scroll-snap-type:   x proximity;
  background-image: url('@/public/images/box-shadow-bg.png');
}
.my-categories-list-container:hover {
  height:             7.28rem;
}
.my-categories-list-container:hover::-webkit-scrollbar             { height:           10px;}

.my-categories-list {
  display:            flex;
  position:           relative;
}
.not-my-categories-list-container::before {
  content: ' ';
  display: block;
  width: var(--ancho-after, 0%);
  height: 106px;
  background: rgba(0,0,0,0.07);
  position: absolute;
  box-shadow: inset 0em 0px 2em 1px rgba(0, 0, 0, 1);
  z-index: 1;
}
</style>
