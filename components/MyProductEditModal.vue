<template>
  <div class="my-product-edit-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ title }}</h5>
      </div>
      <div class="modal-body">
        <div>
          <MyCategoriesList
            @categorySelected="handleCategorySelected"
            :selected="selectedCategoryIndex"
          />
        </div>
        <div>
          <MySelect
            :options="supermercados"
            :selected="selectedSupermercado"
            @select="handleSupermercadoSelected"
          />
        </div>
        <div class="mb-3">
          <MyInput
            v-model="productName"
            :placeholder="'Introduzca el nombre del producto'"
            :autoFocus="true"
            :maxLength="30"
            @updateValue="handleUpdateProductName"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-success me-2"
          @click="handleConfirm"
        >{{ confirmText }}</button>
        <button
          class="btn btn-danger"
          @click="handleCancel"
        >{{ cancelText }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import MyInput from './MyInput.vue';
import MySelect from './MySelect.vue';
import MyCategoriesList from './MyCategoriesList.vue';
import { myStore } from '~/composables/useStore';
import type { Producto, Categoria, Supermercado } from '~/types';
import '~/css/components/MyProductEditModal.css';

const store = myStore();

const props = defineProps({
  title: { type: String, required: true },
  product: { type: Object as () => Producto, required: true },
  confirmText: { type: String, default: 'Aceptar' },
  cancelText: { type: String, default: 'Cancelar' }
});

const emit = defineEmits(['confirm', 'cancel']);

// Estado local
const productName = ref(props.product.text);
const selectedCategory = ref<Categoria | null>(null);
const selectedSupermercado = ref(store.supermercados.value.find(s => s.id === props.product.id_supermercado) || store.supermercados.value[0]);

// Obtener las categorías y supermercados del store
const categorias = computed(() => store.categorias.value);
const supermercados = computed(() => store.supermercados.value);

// Índice de la categoría seleccionada
const selectedCategoryIndex = computed(() => {
  const visibleCategorias = categorias.value.filter(cat => cat.visible);
  return visibleCategorias.findIndex(cat => cat.id === selectedCategory.value?.id);
});

// Handlers
const handleUpdateProductName = (value: string) => {
  productName.value = value;
};

const handleCategorySelected = (category: Categoria) => {
  selectedCategory.value = category;
};

const handleSupermercadoSelected = (supermercado: any) => {
  selectedSupermercado.value = supermercado;
};

const handleConfirm = () => {
  if (productName.value.trim() === '') return;

  // Crear un objeto con los datos actualizados del producto
  const updatedProduct: Partial<Producto> = {
    text: productName.value.trim(),
    id_categoria: selectedCategory.value?.id ?? props.product.id_categoria,
    id_supermercado: selectedSupermercado.value.id
  };

  emit('confirm', updatedProduct);
};

const handleCancel = () => {
  emit('cancel');
};

// Inicializar los valores seleccionados al montar el componente
onMounted(() => {
  // Encontrar la categoría actual del producto
  selectedCategory.value = categorias.value.find(cat => cat.id === props.product.id_categoria) || categorias.value[0];
});
</script>

