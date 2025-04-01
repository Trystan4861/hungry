<template>
  <MyProductListView orderType="a2z" :showEdit="true" :showLetraActual="true" @edit="handleEdit" />
</template>

<script setup lang="ts">
  import type { Producto } from "~/types";
  const handleEdit = (product: Producto) => {
    console.log(product);
    // mostrar un modal para editar el producto seleccionado con un MySelect para los supermercados, teniendo marcado el supermercado actual
    // un MyInput para el nombre del producto
    // un MyCategoriesList para seleccionar la categoría
    // un MyButton para aceptar y otro para cancelar
    // el modal se cierra al hacer click en el botón de aceptar o cancelar
    // si no hay cambios, no hace nada
    // si hay cambios, actualiza el producto en la base de datos
    // si hay errores, muestra un mensaje de error
    // si todo va bien, muestra un mensaje de éxito usando notify
  };
</script>
