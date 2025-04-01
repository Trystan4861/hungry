<template>
  <MyProductListView orderType="a2z" :showEdit="true" :showLetraActual="true" @edit="handleEdit" />
</template>

<script setup lang="ts">
  import type { Producto } from "~/types";
  import { myStore } from "~/composables/useStore";
  import { useMyProductEditModal } from "~/composables/useMyProductEditModal";
  import { notify } from "@kyvg/vue3-notification";
  import { showErrorAlert as showError } from "~/utils/sweetalert";

  const store = myStore();

  /**
   * handleEdit
   * Función que muestra un modal para editar un producto seleccionado
   * @param {Producto} product - El producto seleccionado para editar
   */
  const handleEdit = async (product: Producto) => {
    try {
      // Usar el composable useMyProductEditModal para mostrar un modal de edición
      const { showModal } = useMyProductEditModal();

      const result = await showModal(
        product,
        `Editar ${product.text}`,
        'Guardar',
        'Cancelar'
      );

      if (result.confirmed) {
        const updatedProduct = result.updatedProduct;

        // Verificar si hay cambios
        const hasChanges =
          (updatedProduct.text && updatedProduct.text !== product.text) ||
          (updatedProduct.id_categoria !== undefined && updatedProduct.id_categoria !== product.id_categoria) ||
          (updatedProduct.id_supermercado !== undefined && updatedProduct.id_supermercado !== product.id_supermercado);

        if (!hasChanges) {
          // No se ha modificado el producto, mostrar notificación
          notify({
            group: "app",
            text: `No se realizaron cambios en el producto "${product.text}"`,
            type: "info",
            duration: 3000
          });
          return;
        }

        // Actualizar el producto usando el store
        store.updateProduct(product.id, updatedProduct);

        // Mostrar notificación de éxito
        notify({
          group: "app",
          text: `Producto "${product.text}" actualizado correctamente`,
          type: "success",
          duration: 3000
        });
      }
    } catch (error) {
      showError('Error', 'Ocurrió un error al editar el producto. Inténtalo de nuevo.');
    }
  };
</script>
