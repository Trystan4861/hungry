<template>
  <div class="my-categories-list-container" ref="containerRef" @scroll="handleScroll">
    <div class="categories-padding">
      <div class="my-categories-list" :style="categoryListStyle">
        <MyCategory
          v-for="(category, index) in categories"
          :key="index"
          :text="category.text"
          :bgColor="category.bgColor"
          @categoryClick="handleCategoryClick(index)"
          @categoryLongClick="handleCategoryLongClick(index)"
          :isActive="categoriesState[index]"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import MyCategory from './MyCategory.vue';

export default {
  name: 'MyCategoryList',
  components: {
    MyCategory
  },
  props: {
    categories: {
      type: Array,
      required: true
    },
  },
  emits: ['categorySelected', 'categoryLongClick'],
  setup(props, { emit }) {
    const activeCategoryIndex = ref(null);
    const activeCategory = ref({})
    const categoriesState = ref({});
    categoriesState.value[0] = true;
    activeCategoryIndex.value = 0;
    const containerRef = ref(null);
    const observer = ref(null);

    const seleccionarCategoria = (id_categoria) => {
      let index=props.categories.findIndex(categoria => categoria.id === id_categoria);
      activeCategory.value=props.categories[index]
      activeCategoryIndex.value = index;
    };
    const centrarCategoriaActiva=()=>{ scrollIntoView(activeCategoryIndex.value,'instant') }
    const updateScreenSize = () => { updateCategoryListStyle() };
    onMounted(() => {
      window.addEventListener('resize', updateScreenSize);
      observer.value = new IntersectionObserver((entries) => {entries.forEach(entry => { if (entry.isIntersecting) updateScreenSize() })}, {});
      observer.value.observe(containerRef.value);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateScreenSize);
      if (observer.value) observer.value.disconnect();
    });

    const handleCategoryClick = (index) => {
      activeCategoryIndex.value = index;
      scrollIntoView(activeCategoryIndex.value,'instant')
      emit('categorySelected', props.categories[index], index);
    };
    const handleCategoryLongClick = (index) => {
      activeCategoryIndex.value = index;
      scrollIntoView(activeCategoryIndex.value,'instant')
      emit('categoryLongClick', props.categories[index]);
    };

    watch(activeCategoryIndex, (newValue, oldValue) => {
      if (oldValue !== null) categoriesState.value[oldValue] = false;
      if (newValue !== null) {
        categoriesState.value[newValue] = true;
        activeCategory.value = props.categories[newValue]
      }
    });

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
      let index=Array.from(container.querySelectorAll('.my-category')).indexOf(closestCategory);
      activeCategoryIndex.value = index
      emit('categorySelected', props.categories[index], index);
    };

    const scrollIntoView = (index,behavior='smooth') => {
      const container = containerRef.value;
      if (!container) return false;
      const categoryElement = container.querySelectorAll('.my-category')[index];
      categoryElement.scrollIntoView({
        behavior,
        block: 'center',
        inline: 'center'
      })
    };
    const categoryListStyle = ref({});
    const updateCategoryListStyle = () => {
      const container = containerRef.value;
      if (!container) return;
      let index = activeCategoryIndex.value;
      const category = container.querySelector('.my-category');
      const categorieWidth = category.clientWidth;
      const containerWidth = container.clientWidth;
      const paddingLeftRight = (containerWidth-categorieWidth) / 2;
      categoryListStyle.value = {
        left: `${paddingLeftRight}px`,
        paddingRight: `${paddingLeftRight}px`
      };
      if (!index<0)
        setTimeout(centrarCategoriaActiva,1); //para que cuando se cambia de tamaño la pantalla no se autoseleccione una categoría nueva
    };

    return {
      activeCategoryIndex,
      activeCategory,
      categoriesState,
      handleCategoryClick,
      handleCategoryLongClick,
      containerRef,
      handleScroll,
      categoryListStyle,
      seleccionarCategoria,
      centrarCategoriaActiva
    };
  }
};
</script>

<style scoped>
.my-categories-list-container {
  overflow-x: scroll;
  scrollbar-width: thin;
  scroll-snap-type: x proximity;
  align-items: center;
  display: flex;
  height: 6.875rem;
  background-color: #585858;
}

.my-categories-list {
  display: flex;
  position: relative;
}

</style>