<template>
  <div class="my-categories-list-container" ref="containerRef" @scroll="handleScroll">
    <div class="categories-padding">
      <div class="my-categories-list" :style="categoryListStyle">
        <my-category
          v-for="(category, index) in visibleCategories"
          :key="index"
          :text="category.text"
          :bgColor="category.bgColor"
          @categoryClick="handleCategoryClick(index)"
          @categoryLongClick="handleCategoryLongClick(index)"
          :isActive="index === selectedCategoryIndex" />
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

const selectedCategoryIndex = ref(null);
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
  selectedCategoryIndex.value = index;
};

const centrarCategoriaActiva = () => {
  scrollIntoView(selectedCategoryIndex.value, 'instant');
};

const updateScreenSize = () => {
  updateCategoryListStyle();
};

const handleCategoryClick = (index) => {
  if (lastCategory == index) return;
  selectedCategoryIndex.value = lastCategory = index;
  scrollIntoView(index, 'instant');
  emit('categorySelected', props.categories[index]);
};

const handleCategoryLongClick = (index) => {
  selectedCategoryIndex.value = index;
  scrollIntoView(index, 'instant');
  emit('categoryLongClick', props.categories[index]);
};

watch(selectedCategoryIndex, (newValue, oldValue) => {
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
    selectedCategoryIndex.value = lastCategory = index;
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
  if (selectedCategoryIndex.value >= 0) setTimeout(centrarCategoriaActiva, 1);
};

onMounted(() => {
  selectedCategoryIndex.value = props.selected;
  seleccionarCategoria(selectedCategoryIndex.value);
  window.addEventListener('resize', updateScreenSize, { passive: true });
  observer.value = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && updateScreenSize()));
  observer.value.observe(containerRef.value);
  emit('categorySelected', props.categories[0]);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenSize);
  observer.value && observer.value.disconnect();
});

defineExpose({seleccionarCategoria})
</script>

<style scoped>
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
