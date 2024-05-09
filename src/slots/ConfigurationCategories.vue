<template>
  <div id="SlotConfigurationCategories">
    <div class="text-center mb-1 text-uppercase">Visibilidad de Categorías</div>
    <div class="categoriesContainer">
      <MyCheckbox
        v-for="(item, index) in categorias"
        :key="item.id"
        :value="index"
        :label="item.text"
        :checkedValues="checkedItems"
        group="configCategoriesVisibility"
        :required="true"
        :styled="true"
        @update:checkedValues="handleCheckedValuesUpdate"
        @lastCheckedDeletionAttempt="handleLastCategoryVisible"
      />
    </div>
  </div>
</template>

<script setup>
import MyCheckbox from '@components/MyCheckbox.vue';
import { ref, watchEffect } from 'vue';
import Swal from 'sweetalert2';
import { _DOM } from '@/utilidades';

const props = defineProps({
  categorias: { type: Array, required: true }
});

const checkedItems      = ref([]);
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
    target: _DOM("#SlotConfigurationCategories"),
  });
};

const emit = defineEmits(['categoriesChecked']);

</script>


<style scoped>
.categoriesContainer {
  max-height:         150px;
  overflow-y:         auto;
  margin-bottom:      .625rem;
  border:             3px solid #555;
  border-right-width: 0;
  user-select:        none;
  padding-top:        15px;
}
</style>
