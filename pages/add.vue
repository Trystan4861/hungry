<template>
  <div class="m-3">
    <MyCategoriesList @categorySelected="handleCategorySelected" @categoryLongClick="handleCategoryLongClick"/>
    <MySelect class="my-select mt-4" :selected="supermercado" :options="store.supermercados.value" @select="handleSupermercadoSelected" />
    <MyInput
    class="mb-4"
    v-model="name"
    :placeholder="'Introduzca el nombre del producto'"
    id="nuevoProducto"
    :autoFocus="true"
    :maxLength="30"
    @updateValue="handleUpdateValue"
    @keyPressed:enter="handleKeyPressedEnter"
  />
  <MyButton
    :text="'Añadir'"
    :disabled="name.length === 0"
    @click="handleAdd"
    class="mt-4 btn btn-success text-white fw-bold"
  />
</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Categoria, Supermercado } from "~/types";
import { myStore } from "~/composables/useStore";
import { showErrorAlert as showError } from "~/utils/sweetalert";
import { notify } from "@kyvg/vue3-notification";

const store = myStore();
const category = ref<Categoria>(store.categorias.value[0]);
const supermercado = ref<Supermercado>(store.supermercados.value[0]);
const name = ref("");
const isAdding = ref(false);

const handleUpdateValue = (value: string) => {
  name.value = value;
};
const handleCategorySelected = (selectedCategory: Categoria) => {
  category.value = selectedCategory;
};
const handleCategoryLongClick = (category: Categoria) => {
  /**
   * TODO:
   * - Abrir modal con formulario para editar categoría.
   */
};

const handleKeyPressedEnter = () => {
  if (!isAdding.value && name.value.trim() !== '') {
    handleAdd();
  }
};

const handleSupermercadoSelected = (selectedSupermercado: Supermercado) => {
  supermercado.value = selectedSupermercado;
};

const handleAdd = () => {
  if (name.value==''){
    showError('Error', 'Debes introducir un nombre para el nuevo producto');
    return;
  }

  if (isAdding.value) return; // Evitar múltiples clics

  isAdding.value = true;

  try {
    // Usar el store para añadir el producto
    store.addProduct(
      name.value,
      category.value.id,
      supermercado.value.id
    );

    notify({
      group: "app",
      text: `Producto «${name.value}» añadido correctamente en ${category.value.text} para poder comprarlo en ${supermercado.value.text}`,
      type: "success",
      duration: 3000
    });

    name.value = '';
  } catch (error) {
    console.error('Error al añadir producto:', error);
    showError('Error', 'Ocurrió un error al añadir el producto. Inténtalo de nuevo.');
  } finally {
    isAdding.value = false;
  }
};
</script>

<style scoped>
.my-select {
  max-width: 100%;
}
</style>
