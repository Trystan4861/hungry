<template>
  <div id="SlotConfigurationCategories">
    <div class="text-center mb-1">Visibilidad de Categorías</div>
    <div class="categoriesContainer">
      <my-checkbox
        v-for="(item, index) in visibleCategories"
        :key="index"
        :value="index"
        :label="item.text"
        :checkedValues="checkedItems"
        :group="'configCategoriesVisibility'"
        :required="true"
        :styled="true"
        :dotDiameter="'1rem'"
        :checkedColor="'#6c757d'"
        :uncheckedColor="'#333'"
        :checkmarkColor="'white'"
        :crossColor="'white'"
        @update:checkedValues="handleCheckedValuesUpdate"
        @lastCheckedDeletionAttempt="handleLastCategoryVisible"
      />
    </div>
  </div>
</template>

<script>
import MyCheckbox from '@/components/MyCheckbox.vue';
import { ref, watchEffect } from 'vue';
import Swal from 'sweetalert2';

export default {
  name: 'SlotConfigurationCategories',
  props: {
    categorias: {
      type: Array,
      required: true
    }
  },
  components: {
    MyCheckbox,
  },
  setup(props, { emit }) {
    const checkedItems = ref([]);
    const visibleCategories = ref([]);
    
    const getVisibleIndices = data => data.map((item, index) => (item.visible ? index : null)).filter(index => index !== null);
    
    watchEffect(() => {
      visibleCategories.value = props.categorias.filter(item => item.visible);
      checkedItems.value = getVisibleIndices(props.categorias);
    });
    
    const handleCheckedValuesUpdate = (newCheckedItems) => {
      checkedItems.value = newCheckedItems.sort((a, b) => a - b);
      emit('categoriesChecked', newCheckedItems);
    };
    
    const handleLastCategoryVisible = () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: "Al menos una categoría debe permanecer visible",
        confirmButtonText: 'Aceptar',
        target: document.querySelector("#SlotConfigurationCategories"),
      });
    };

    return {
      checkedItems,
      visibleCategories,
      handleLastCategoryVisible,
      handleCheckedValuesUpdate,
    };
  },
  emits: ['categoriesChecked', 'buttonClicked']
};
</script>

<style scoped>
.categoriesContainer {
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: .625rem;
  border: 1px solid;
  border-right-width: 0;
  user-select: none;
  padding-top: 15px
}
::-webkit-scrollbar { height: 4px; width: 4px; }
::-webkit-scrollbar-track { background: #f0f0f0; }
::-webkit-scrollbar-thumb { background: #888; }
</style>
