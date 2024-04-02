<template>
  <div id="SlotConfigurationCategories">
    <div class="text-center mb-1">Visibilidad de Categorías</div>
    <div class="categoriesContainer">
      <MyCheckbox
        v-for="(item, index) in categorias"
        :key="index"
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
import { ref, watchEffect, defineEmits,defineProps } from 'vue';
import Swal from 'sweetalert2';

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
    target: document.querySelector("#SlotConfigurationCategories"),
  });
};

const emit = defineEmits(['categoriesChecked', 'buttonClicked']);

</script>


<style scoped>
  @import url('@css/SlotConfigurationCategories.vue.css');
</style>
