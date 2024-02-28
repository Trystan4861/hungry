<template>
  <div>
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
  </div>
</template>

<script>
import MyCheckbox from './MyCheckbox.vue';
import MyButton from './MyButton.vue';

import { useStore } from 'vuex';
import { ref, watchEffect } from 'vue';
import Swal from 'sweetalert2';

export default {
  name: 'SlotConfigurationCategories',
  components: {
    MyCheckbox,
    MyButton,
  },
  setup(props, { emit }) {
    const store = useStore();
    const checkedItems = ref([]);
    const categorias = ref([]);

    // Función para obtener los índices de los elementos visibles
    function getVisibleIndices(categorias) {
      return categorias.reduce((acc, curr, index) => {
        if (curr.visible) {
          acc.push(index);
        }
        return acc;
      }, []);
    }

    // Inicialización de categorias y checkedItems
    categorias.value = store.getters.getCategorias();
    checkedItems.value = getVisibleIndices(categorias.value);

    // Reaccionar a cambios en categorias
    watchEffect(() => {
      categorias.value = store.getters.getCategorias();
      checkedItems.value = getVisibleIndices(categorias.value);
    });

    const handleClick = () => emit('buttonClicked');
    const handleCheckedValuesUpdate = (newCheckedItems) => {
      checkedItems.value = newCheckedItems;
      emit('categoriesChecked', newCheckedItems);
    };
    const handleLastCategoryVisible = () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: "Al menos una categoría debe permanecer visible",
        confirmButtonText: 'Aceptar'
      });
    };

    return {
      categorias,
      checkedItems,
      handleLastCategoryVisible,
      handleCheckedValuesUpdate,
      handleClick
    };
  },
  emits: ['categoriesChecked', 'buttonClicked']
};
</script>

<style scoped>
.categoriesContainer {
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: .625rem;
  scrollbar-width: thin;
  scrollbar-color: #888 #f0f0f0;
  user-select: none;
}
</style>
