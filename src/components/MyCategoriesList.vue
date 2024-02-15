<template>
    <div class="my-categories-list-container">
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
import MyCategory from './MyCategory.vue'; // Asumiendo que tienes el componente MyCategory


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
    emits: ['categorySelected','categoryLongClick'],
    setup(props,{emit}) {
        const activeCategoryIndex = ref(null);
        const categoriesState = ref({});
        categoriesState.value[0]=true;
        activeCategoryIndex.value=0;
        const handleCategoryClick = (index) => {
            activeCategoryIndex.value=index;
            emit('categorySelected',props.categories[index],index);
        };
        const handleCategoryLongClick = (index) => {
            activeCategoryIndex.value=index;
            emit('categoryLongClick',props.categories[index]);
        };
        watch(activeCategoryIndex,(newValue, oldValue)=>{
            if (oldValue !== null) categoriesState.value[oldValue]=false;
            if (newValue !== null) categoriesState.value[newValue]=true;
        })

        return {
            activeCategoryIndex,
            categoriesState,
            handleCategoryClick,
            handleCategoryLongClick
      };
    },
    methods:{

    }
  };
  </script>

<style scoped>
.my-categories-list-container
{
  overflow-x: scroll;
  scrollbar-width: thin;
  scroll-snap-type: x proximity;
}
.my-categories-list {
  display: flex;
}
.categories-padding
{
  width: 2330px;
  padding-left: 30%;
  padding-right: 30%;
}
</style>