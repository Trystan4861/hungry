<template>
    <p>Cambiar visibilidad de Categorías</p>
    <div class="categoriesContainer">
      <MyCheckbox
        v-for="(item, index) in categorias"
        :key="index"
        :value="index"
        :label="item.text"
        :checkedValues="checkedItems"
        :group="'configCategoriesVisibility'"
        :required="true"
        @update:checkedValues="handleCheckedValuesUpdate"
        @lastCheckedDeletionAttempt="handleLastCategoryVisible"
      />
    </div>
    <MyButton :text="'Guardar Categorías Visibles'" :btnClass="'secondary'" @click="handleClick"/>
</template>
<script>
import MyCheckbox from './MyCheckbox.vue';
import MyButton from './MyButton.vue';

import { useStore } from 'vuex';
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';

export default {
  name: 'SlotConfigurationCategories',
  components: {
    MyCheckbox,
    MyButton,
  },
  setup(props,{emit}) {
    const categorias = useStore().getters.getCategorias().map(categoria => ({ ...categoria }));
    const checkedItems = ref([]);

    onMounted(() => {
      checkedItems.value = categorias.reduce((acc, curr, index) => {
        if (curr.visible) {
          acc.push(index);
        }
        return acc;
      }, []);
    });

    const handleClick=()=>emit('buttonClicked')
    const handleCheckedValuesUpdate = (newCheckedItems) => {
      checkedItems.value = newCheckedItems;
      emit('categoriesChecked',newCheckedItems)
    };
    const handleLastCategoryVisible=()=>Swal.fire({
            icon:'error',
            title:'Error',
            html:"Al  menos una categoría debe permanecer visible",
            confirmButtonText:'Aceptar'
          })
    return {
      categorias,
      checkedItems,
      handleLastCategoryVisible,
      handleCheckedValuesUpdate,
      handleClick
    };
  },
  emits: ['categoriesChecked','buttonClicked']
};
</script>
<style scoped>
  .categoriesContainer{
    max-height: 250px;
    overflow-y: auto;
    margin-bottom: .625rem;
    scrollbar-width: thin;
    scrollbar-color: #888 #f0f0f0;
    user-select: none;
}
</style>