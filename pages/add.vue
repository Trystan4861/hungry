<template>
  <div class="m-3">
    <MyCategoriesList @categorySelected="handleCategorySelected" @categoryLongClick="handleCategoryLongClick"/>
    <MySelect class="my-select mt-4" v-model="supermercado" :selected="supermercado" :options="store.supermercados.value" @select="handleSupermercadoSelected" />
    <MyInput
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
    class="mt-4"
  />
</div>
Producto: {{ name }}<br>
Categoría: {{ category.text + ' - ' + category.id }}<br>
Supermercado: {{ supermercado.text + ' - ' + supermercado.id }}
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Categoria, Supermercado } from "~/types";
import { myStore } from "~/composables/useStore";

const store = myStore();
const category = ref<Categoria>(store.categorias.value[0]);
const supermercado = ref<Supermercado>(store.supermercados.value[0]);
const name = ref("");

const handleUpdateValue = (value: string) => {
  name.value = value;
};
const handleCategorySelected = (selectedCategory: Categoria) => {
  category.value = selectedCategory;
};
const handleCategoryLongClick = (category: Categoria) => {
  console.log("Long click on category" + category.text)
};

const handleKeyPressedEnter = () => {
  console.log('Enter key pressed');
};

const handleSupermercadoSelected = (selectedSupermercado: Supermercado) => {
  supermercado.value = selectedSupermercado;
};

const handleAdd = () => {
  console.log('Add product', name.value, category.value.id, supermercado.value.id );
};
</script>

<style scoped>
.my-select {
  max-width: 100%;
}
</style>
