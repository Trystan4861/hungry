<template>
  <div class="my-categories-list-container" ref="containerRef" @scroll="handleScroll">
    <img class="leftShadow shadow" src="@/public/images/box-shadow-left.png" draggable="false" />
    <img class="rightShadow shadow" src="@/public/images/box-shadow-right.png" draggable="false" />
    <div class="categories-padding">
      <div class="my-categories-list" :style="categoryListStyle">
        <my-category
          v-for="(category, index) in visibleCategories"
          :key="index"
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
import { ref, defineExpose, defineProps, defineEmits, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import MyCategory from '@/components/MyCategory.vue'

const props = defineProps({
  categories: { type: Array, required: true },
  selected: { type: Number, default: 0 }
});

const emit = defineEmits(['categorySelected', 'categoryLongClick']);

const selected = ref(props.selected);
const activeCategory = ref({});
const categoriesState = ref({});
const containerRef = ref(null);
const observer = ref(null);
let lastCategory = null;
const categoryListStyle = ref({});

categoriesState.value[0] = true;

const seleccionarCategoria = (id_categoria) => {
  const index = props.categories.findIndex(categoria => categoria.id === id_categoria);
  activeCategory.value = props.categories[index];
  selected.value = index;
};

const centrarCategoriaActiva = () => {
  scrollIntoView(selected.value, 'instant');
};

const updateScreenSize = () => {
  updateCategoryListStyle();
};

const handleCategoryClick = (index) => {
  console.log("click")
  if (lastCategory == index) return;
  selected.value = lastCategory = index;
  scrollIntoView(index, 'instant');
  emit('categorySelected', props.categories[index]);
};

const handleCategoryLongClick = (index) => {
  selected.value = index;
  scrollIntoView(index, 'instant');
  emit('categoryLongClick', props.categories[index]);
};

watch(selected, (newValue, oldValue) => {
  oldValue !== null && (categoriesState.value[oldValue] = false);
  newValue !== null && (categoriesState.value[newValue] = true, activeCategory.value = props.categories[newValue]);
});
watch(()=>props.selected,newValue=>seleccionarCategoria(newValue))

const visibleCategories = computed(() => props.categories.filter(category => Boolean(category.visible) === true));

const handleScroll = () => {
  const container = containerRef.value;
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  const categories = container.querySelectorAll('.my-category');

  let closestCategory = null;
  let minDistance = Infinity;

  categories.forEach((category) => {
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
    emit('categorySelected', props.categories[index]);
  }
};

const scrollIntoView = (index, behavior = 'smooth') => {
  containerRef.value?.querySelectorAll('.my-category')[index]?.scrollIntoView({ behavior, block: 'center', inline: 'center' });
};

const updateCategoryListStyle = () => {
  const container = containerRef.value;
  if (!container) return;
  const plr = (container?.clientWidth - container.querySelector('.my-category')?.clientWidth) / 2;
  categoryListStyle.value = { left: `${plr}px`, paddingRight: `${plr}px` };
  if (selected.value >= 0) setTimeout(centrarCategoriaActiva, 1);
};

onMounted(() => {
  //selected.value = props.selected;
  seleccionarCategoria(selected.value);
  window.addEventListener('resize', updateScreenSize, { passive: true });
  observer.value = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && updateScreenSize()));
  observer.value.observe(containerRef.value);
  emit('categorySelected', props.categories[0]);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenSize);
  observer.value && observer.value.disconnect();
});

defineExpose({seleccionarCategoria,selected})
</script>

<style scoped>
.shadow{
  top:10px;
  position: absolute;
  user-select: none; 
  z-index: 100;
  width: 100px;
  clip-path: border-box;
  height: 107px;
}
.leftShadow{
  top:10px;
}
.rightShadow{
  right:0px;
  margin-right: 10px
}
.swal .shadow{
  top:0px;
  z-index: 1;
}
.swal .leftShadow{
    left: 29px;
    top: 95px;
}
.swal .rightShadow{
  right: 19px;
  top: 95px;
}

.my-categories-list-container {
  align-items: center;
  background-color: #585858;
  display: flex;
  height: 6.875rem;
  overflow-x: scroll;
  scroll-snap-type: x proximity;
}

.my-categories-list {
  display: flex;
  position: relative;
}

</style>
