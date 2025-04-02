<template>
  <div class="my-categories">
    <div class="leftShadow myShadow"></div>
    <div class="rightShadow myShadow"></div>
    <div class="my-categories-list-container" ref="containerRef" @scroll="handleScroll">
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
  </div>
</template>

<script lang="ts"  setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { myStore } from '~/composables/useStore';
import type { Categoria } from '~/types';
import '~/css/components/MyCategoriesList.css';

const props = defineProps({
  selected: { type: Number, default: 0 }
});

const emit = defineEmits(['categorySelected', 'categoryLongClick']);

const store = myStore();
const categories=computed(()=>store.categorias.value)
const selected = ref<number>(props.selected);
const activeCategory = ref<Categoria | null>(null);
const categoriesState = ref(new Array(categories.value.length).fill(false));
const containerRef = ref(null as unknown as HTMLElement);
const observer = ref(null as unknown as IntersectionObserver);
const lastCategory = ref(-1);
const categoryListStyle = ref({});

const seleccionarCategoria = (id_categoria: number) => {
  const index = visibleCategories.value.findIndex(categoria => categoria.id === id_categoria);
  if (index !== -1) {
    activeCategory.value = visibleCategories.value[index];
    selected.value = index;
  }
};

const centrarCategoriaActiva = () => {
  scrollIntoView(selected.value, 'instant');
};

const handleCategoryClick = (index: number) => {
  if (lastCategory.value == index) return;
  selected.value = lastCategory.value = index;
  scrollIntoView(index, 'instant');
  emit('categorySelected', visibleCategories.value[index]);
};

const handleCategoryLongClick = (index: number) => {
  selected.value = index;
  scrollIntoView(index, 'instant');
  emit('categoryLongClick', visibleCategories.value[index]);
};

watch(selected, (newValue, oldValue) => {
  oldValue !== null && (categoriesState.value[oldValue] = false);
  newValue !== null && (categoriesState.value[newValue] = true, activeCategory.value = visibleCategories.value[newValue]);
});
watch(()=>props.selected,newValue=>seleccionarCategoria(newValue))

const visibleCategories = computed(() => categories.value.filter(category => Boolean(category.visible) === true));

const handleScroll = () => {
  const container = containerRef.value as unknown as HTMLElement;
  if (!container) return;

  const containerRect = container.getBoundingClientRect() as DOMRect;
  const containerCenter = containerRect.left + containerRect.width / 2;
  const categoriesContainer = container.querySelectorAll('.my-category') as NodeListOf<HTMLElement>;

  let closestCategory = null;
  let minDistance = Infinity;

  categoriesContainer.forEach((category: HTMLElement) => {
    const categoryRect = category.getBoundingClientRect();
    const categoryCenter = categoryRect.left + categoryRect.width / 2;
    const distance = Math.abs(containerCenter - categoryCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestCategory = category;
    }
  });
  const index = Array.from(container.querySelectorAll('.my-category')).indexOf(closestCategory as unknown as HTMLElement);
  if (lastCategory.value != index) {
    selected.value = lastCategory.value = index;
    emit('categorySelected', visibleCategories.value[index]);
  }
};

const scrollIntoView = (index: number, behavior: ScrollBehavior = 'smooth') => {
  const container = containerRef.value as unknown as HTMLElement;
  if (!container) return;
  container.querySelectorAll('.my-category')[index]?.scrollIntoView({ behavior, block: 'center', inline: 'center' });
};

const doResize = () => {
  const container = containerRef.value as unknown as HTMLElement;
  if (!container) return;

  const parent=container.parentElement as unknown as HTMLElement;
  const parentS= window.getComputedStyle(parent)
  const parentCR=parent.getClientRects()
  parentCR[0]?.width && parent.style.setProperty('--ancho-after', `calc( ${parentCR[0].width}px - ${parentS.paddingLeft} - ${parentS.paddingRight})`);

  const plr = (container?.clientWidth - (container.querySelector('.my-category') as unknown as HTMLElement)?.clientWidth) / 2;
  categoryListStyle.value = { left: `${plr}px`, paddingRight: `${plr}px` };
  if (selected.value >= 0) setTimeout(centrarCategoriaActiva, 1);
};

onMounted(() => {
  //selected.value = props.selected;
  seleccionarCategoria(selected.value);
  window.addEventListener('resize', doResize, { passive: true });
  observer.value = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && doResize()));
  if (containerRef.value) {
    observer.value.observe(containerRef.value);
  }
  emit('categorySelected', categories.value[0]);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', doResize);
  observer.value && observer.value.disconnect();
});

defineExpose({seleccionarCategoria,selected})

</script>


