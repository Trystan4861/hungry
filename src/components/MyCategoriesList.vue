<template>
  <div class="my-categories-list-container" ref="containerRef" @scroll="handleScroll">
    <div class="categories-padding">
      <div class="my-categories-list">
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
import { ref, watch } from 'vue';
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
    }
  },
  emits: ['categorySelected', 'categoryLongClick'],
  setup(props, { emit }) {
    const activeCategoryIndex = ref(null);
    const categoriesState = ref({});
    categoriesState.value[0] = true;
    activeCategoryIndex.value = 0;
    const containerRef = ref(null);

    const handleCategoryClick = (index) => {
      scrollIntoView(index);
      activeCategoryIndex.value = index;
      emit('categorySelected', props.categories[index], index);
    };
    const handleCategoryLongClick = (index) => {
      activeCategoryIndex.value = index;
      emit('categoryLongClick', props.categories[index]);
      scrollIntoView(index);
    };

    watch(activeCategoryIndex, (newValue, oldValue) => {
      if (oldValue !== null) categoriesState.value[oldValue] = false;
      if (newValue !== null) categoriesState.value[newValue] = true;
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

      // Activar el subcomponente más cercano al centro
      activeCategoryIndex.value = Array.from(container.querySelectorAll('.my-category')).indexOf(closestCategory);
      // Emitir evento o activar el subcomponente según sea necesario
    };

    const scrollIntoView = (index) => {
      const container=containerRef.value;
      if (!container)
        return false;
      const categoryElement = container.querySelectorAll('.my-category')[index];
      categoryElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    };

    return {
      activeCategoryIndex,
      categoriesState,
      handleCategoryClick,
      handleCategoryLongClick,
      containerRef,
      handleScroll
    };
  }
};
</script>

<style scoped>
.my-categories-list-container {
  overflow-x: scroll;
  scrollbar-width: thin;
  scroll-snap-type: x proximity;
  height: 110px;
}

.my-categories-list {
  display: flex;
}

.categories-padding {
  width: 2330px;
  padding-left: 30%;
  padding-right: 30%;
}
</style>