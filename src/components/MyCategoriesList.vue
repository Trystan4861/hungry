<template>
    <div class="my-categories-list-container">
      <div class="my-categories-list">
            <MyCategory
      v-for="(category, index) in categories"
      :key="index"
      :text="category.text"
      :bgColor="category.bgColor"
      @categoryClick="handleCategoryClick(index)"
      :isActive="categoriesState[index]"
    />
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
    emits: ['categorySelected'],
    setup(props,{emit}) {
        const activeCategoryIndex = ref(null);
        const categoriesState = ref({});
        
        const handleCategoryClick = (index) => {
            activeCategoryIndex.value=index;
            emit('categorySelected',props.categories[index],index);
        };
        watch(activeCategoryIndex,(newValue, oldValue)=>{
            if (oldValue !== null) categoriesState.value[oldValue]=false;
            if (newValue !== null) categoriesState.value[newValue]=true;
        })
        return {
            activeCategoryIndex,
            categoriesState,
            handleCategoryClick
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
}
.my-categories-list {
  display: flex;
}
</style>