<template>
  <div v-show="hayProductosSeleccionados">
    <div class="me-0 d-flex filaAcciones">
      <MySelect
        v-show="hayMultiplesSupermercados"
        class="flex-grow-1"
        ref="supermarketAtShoppingList"
        :options="supermercadosAMostrar"
        :selected="selectedSupermarket"
        @select="handleSupermarketChange"
      />
      <div
        v-show="!hayMultiplesSupermercados"
        class="shoppingList"
      >
        LISTA DE LA COMPRA
      </div>
      <MyButton
        class="danger bold clearList"
        text="Limpiar Lista"
        :styleButton="{width: anchoBotonLimpiarLista, borderRadius:'0px'}"
        @click="handleClearList"
      />
    </div>
  </div>

  <div
    class="rounded-bottom listaCompra"
    :class="{ 'h-100': !hayProductosSeleccionados }"
  >
    <!-- Contador de productos por comprar -->
    <div
      v-show="hayProductosSeleccionados"
      class="text-end mt-2 me-2"
    >
      {{ amount2Buy }} producto{{ pluralizar(amount2Buy) }} por comprar
    </div>

    <!-- Mensaje cuando la lista está vacía -->
    <div
      v-show="!hayProductosSeleccionados"
      class="h-100"
    >
      <div class="d-flex justify-content-center align-items-center h-100">
        <h2 class="text-uppercase text-center">La lista de la compra está vacía</h2>
      </div>
    </div>

    <!-- Productos del supermercado actual -->
    <div v-show="AmountInThisSupermarket > 0">
      <div class="w-100 text-center mt-2">
        Puedes comprar en {{ supermercado }}: {{ AmountInThisSupermarket }} producto{{ pluralizar(AmountInThisSupermarket) }}
        <hr />
      </div>
      <MyProductList
        orderBy="categoryId"
        :canBeDone="true"
        filter="undone"
        :productList="productosEnSupermercadoActual"
        :selected="true"
        :supermercado="id_supermercado || 0"
        @update:done="handleShoplistClick"
      />
    </div>

    <!-- Productos de otros supermercados -->
    <div v-show="mostrarProductosOtrosSupermercados">
      <div
        class="w-100 text-center"
        v-if="hayMultiplesSupermercadosMostrados"
      >
        Puedes comprar en otros Supermercados: {{ AmountInOtherSupermarkets }} producto{{ pluralizar(AmountInOtherSupermarkets) }}
        <hr />
      </div>
      <div
        class="w-100 text-center"
        v-else
      >
        En Supermercados ocultos: {{ AmountInOtherSupermarkets }} producto{{ pluralizar(AmountInOtherSupermarkets) }}
        <hr />
      </div>
      <MyProductList
        orderBy="categoryId"
        :canBeDone="true"
        filter="undone"
        :hideSupermercado="true"
        :productList="productosEnOtrosSupermercados"
        :selected="true"
        :supermercado="id_supermercado || 0"
        @update:done="handleShoplistClick"
      />
    </div>

    <!-- Productos ya comprados -->
    <div v-show="amountBuyed > 0">
      <div class="w-100 text-center">
        Productos comprados: {{ amountBuyed }} producto{{ pluralizar(amountBuyed) }}
        <hr />
      </div>
      <MyProductList
        orderBy="categoryId"
        :canBeDone="true"
        :productList="productosComprados"
        :selected="true"
        filter="done"
        @update:done="handleShoplistClick"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  /**
   * Cart.vue
   * Componente para gestionar la lista de la compra
   * Permite ver y gestionar los productos seleccionados, filtrados por supermercado
   * y marcar/desmarcar productos como comprados
   */

  // ===== IMPORTACIONES =====
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import { myStore } from "~/composables/useStore";
  import { _DOM } from "~/utils";
  import { showErrorAlert as showError, showConfirmWithOptions } from "~/utils/sweetalert";
  import { notify } from "@kyvg/vue3-notification";
  import type { Producto, Supermercado, Categoria, MySelectOption, NotifyItemData } from '~/types';

  // ===== CONSTANTES =====
  const lastClickTimeout = 400;
  const store = myStore();

  // ===== ESTADO REACTIVO =====
  // Referencias reactivas principales
  const productsData = ref<Producto[]>(store.sortedByCategory.value);
  const categoriesData = ref<Categoria[]>(store.categorias.value);
  const lastClick = ref(Date.now());
  const isProcessingClick = ref(false);
  const anchoBotonLimpiarLista = ref('100px');

  // ===== UTILIDADES =====
  /**
   * pluralizar
   * Devuelve 's' si el número es distinto de 1, o cadena vacía si es 1
   * @param num Número a evaluar
   * @returns Sufijo para pluralizar
   */
  const pluralizar = (num: number): string => num !== 1 ? 's' : '';

  // ===== GESTIÓN DE SUPERMERCADOS =====
  // Propiedades computadas para mejorar la legibilidad del template
  const hayProductosSeleccionados = computed(() => productosSeleccionados.value.length > 0);
  const hayMultiplesSupermercados = computed(() => supermercadosVisibles.value.length > 1);
  const hayMultiplesSupermercadosMostrados = computed(() => supermercadosAMostrar.value.length > 1);
  const mostrarProductosOtrosSupermercados = computed(() =>
    AmountInOtherSupermarkets.value > 0 && hayMultiplesSupermercados.value
  );

  // Filtrado de supermercados
  const supermercadosVisibles = computed(() =>
    store.supermercados.value.filter((i: Supermercado) => i.visible)
  );

  /**
   * Filtra los supermercados visibles, excluyendo el supermercado genérico (id=0)
   * cuando hay más de un supermercado
   */
  const supermercadosAMostrar = computed(() => {
    // Evitamos la copia profunda innecesaria usando filter directamente
    if (supermercadosVisibles.value.length > 1) {
      return supermercadosVisibles.value.filter((i: Supermercado) => i.id !== 0);
    }
    return supermercadosVisibles.value;
  });

  const selectedSupermarket = ref<MySelectOption>(supermercadosAMostrar.value[0]);
  const id_supermercado = computed(() => selectedSupermarket.value?.id ?? 0);
  const supermercado = computed(() => selectedSupermarket.value?.text ?? 'Cualquier Supermercado');

  /**
   * Maneja el cambio de supermercado seleccionado
   * @param option Opción seleccionada en el dropdown
   */
  const handleSupermarketChange = (option: MySelectOption): void => {
    selectedSupermarket.value = option;
  };

  // ===== FILTRADO DE PRODUCTOS =====
  // Productos seleccionados (en la lista de la compra)
  const productosSeleccionados = computed(() =>
    productsData.value.filter((item: Producto) => item.selected)
  );

  // Productos por comprar (no marcados como comprados)
  const productosPorComprar = computed(() =>
    productosSeleccionados.value.filter((item: Producto) => !item.done)
  );

  // Contadores para la interfaz
  const amount2Buy = computed(() => productosPorComprar.value.length);
  const amountBuyed = computed(() => productosSeleccionados.value.length - amount2Buy.value);

  // Productos del supermercado actual
  const productosEnSupermercadoActual = computed(() =>
    productosPorComprar.value.filter((item: Producto) =>
      item.id_supermercado === id_supermercado.value || item.id_supermercado === 0
    )
  );

  const AmountInThisSupermarket = computed(() => productosEnSupermercadoActual.value.length);

  // Productos de otros supermercados
  const productosEnOtrosSupermercados = computed(() =>
    productosPorComprar.value.filter((item: Producto) =>
      item.id_supermercado !== id_supermercado.value && item.id_supermercado !== 0
    )
  );

  const AmountInOtherSupermarkets = computed(() => productosEnOtrosSupermercados.value.length);

  // Productos ya comprados
  const productosComprados = computed(() =>
    productosSeleccionados.value.filter((item: Producto) => item.done)
  );

  // ===== GESTIÓN DE LA INTERFAZ =====
  /**
   * Recalcula el ancho del botón "Limpiar Lista" para que coincida con el ancho del último elemento nav
   */
  const recalculateAnchoBotonLimpiarLista = (): void => {
    const element = _DOM(".nav-item:last-child");
    if (element?.getClientRects?.()?.[0]) {
      anchoBotonLimpiarLista.value = `${element.getClientRects()[0].width ?? 100}px`;
    } else {
      anchoBotonLimpiarLista.value = '100px';
    }
  };

  // Manejador del evento resize con debounce
  let resizeTimeout: number | null = null;
  const handleResize = (): void => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(recalculateAnchoBotonLimpiarLista, 50);
  };

  // Configuración de eventos
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }

  onMounted(() => {
    setTimeout(recalculateAnchoBotonLimpiarLista, lastClickTimeout);
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  });

  // ===== MANEJADORES DE EVENTOS =====
  /**
   * Maneja el clic en un producto para marcarlo/desmarcarlo como comprado
   * @param item Producto sobre el que se ha hecho clic
   * @param value Nuevo valor para el estado "done" del producto
   */
  const handleShoplistClick = (item: Producto, value: boolean): void => {
    // Evitar procesamiento múltiple de clics
    if (isProcessingClick.value || Date.now() - lastClick.value < lastClickTimeout) {
      return;
    }

    isProcessingClick.value = true;
    lastClick.value = Date.now();

    try {
      // Actualizar el estado del producto
      const producto = store.findProducto(item.id);
      if (producto) {
        // Actualizar con el valor exacto recibido del evento
        producto.done = value;

        // Guardar los cambios en el store
        store.updateProduct(item.id, { done: value });

        // Forzar actualización de la vista
        productsData.value = [...store.sortedByCategory.value];

        // Si el producto se marcó como comprado, mostrar notificación con opción para deshacer
        if (value) {
          // Duración de la notificación en milisegundos (5 segundos)
          const notificationDuration = 5000;

          // Crear un ID único para la notificación
          const notificationId = Date.now();

          // Mostrar notificación con botón para deshacer
          notify({
            id: notificationId,
            group: "buttons",
            title: "Producto marcado como comprado",
            text: `${item.text} ha sido marcado como comprado`,
            duration: notificationDuration,
            data: {
              buttonText: "Deshacer",
              buttonClass: "btn-danger", // Clase para el botón (fondo rojo)
              onClick: () => {
                // Deshacer la acción (marcar como no comprado)
                const productoActualizado = store.findProducto(item.id);
                if (productoActualizado) {
                  productoActualizado.done = false;
                  store.updateProduct(item.id, { done: false });
                  productsData.value = [...store.sortedByCategory.value];
                }

                // Cerrar la notificación
                notify.close(notificationId);
              },
              progressBarDuration: notificationDuration
            } as NotifyItemData
          });
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado de producto:', error);
    } finally {
      // Restablecer flag después del timeout
      setTimeout(() => {
        isProcessingClick.value = false;
      }, lastClickTimeout);
    }
  };

  /**
   * Maneja el clic en el botón "Limpiar Lista"
   * Muestra un diálogo de confirmación y limpia la lista según la opción seleccionada
   * Incluye un paso adicional de verificación solo cuando se eliminarán productos sin comprar
   */
  const handleClearList = async (): Promise<void> => {
    const selectedProducts = store.productos.value.filter((item: Producto) => item.selected);
    const hayProductosCompradosYPendientes =
      selectedProducts.some((item: Producto) => item.done) &&
      !selectedProducts.every((item: Producto) => item.done);

    // Número total de productos en la lista
    const totalProductos = selectedProducts.length;
    const productosComprados = selectedProducts.filter(item => item.done).length;
    const productosPendientes = totalProductos - productosComprados;

    // Primer diálogo de confirmación
    const result = await showConfirmWithOptions(
      'Atención',
      hayProductosCompradosYPendientes
        ? '¿Qué elementos desea eliminar?'
        : 'Esto limpiará la lista de la compra',
      {
        confirmButtonText: hayProductosCompradosYPendientes ? 'Todos' : 'Aceptar',
        denyButtonText: 'Ya Comprados',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-danger me-2',
          denyButton: 'btn btn-warning me-2',
          cancelButton: 'btn btn-success',
        },
        showDenyButton: hayProductosCompradosYPendientes
      }
    );

    // Si el usuario elige eliminar solo los productos comprados
    if (result.isDenied) {
      // No se requiere confirmación adicional para eliminar productos ya comprados
      try {
        store.clearList(true);
        // Forzar actualización de la vista
        productsData.value = [...store.sortedByCategory.value];
      } catch (error) {
        console.error('Error al limpiar productos comprados:', error);
        showError('Error', 'Ocurrió un error al limpiar la lista. Inténtalo de nuevo.');
      }
    }
    // Si el usuario elige eliminar todos los productos
    else if (result.isConfirmed) {
      // Verificación adicional solo si hay productos sin comprar
      if (productosPendientes > 0) {
        const confirmacionAdicional = await showConfirmWithOptions(
          'Confirmar eliminación',
          `¿Está seguro de eliminar ${productosPendientes} producto${pluralizar(productosPendientes)} sin comprar?`,
          {
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
              confirmButton: 'btn btn-danger me-2',
              cancelButton: 'btn btn-success',
            }
          }
        );

        if (!confirmacionAdicional.isConfirmed) {
          return; // Cancelar la operación si el usuario no confirma
        }
      }

      // Limpiar todos los productos seleccionados
      try {
        store.clearList(false);
        // Forzar actualización de la vista
        productsData.value = [...store.sortedByCategory.value];
      } catch (error) {
        console.error('Error al limpiar todos los productos:', error);
        showError('Error', 'Ocurrió un error al limpiar la lista. Inténtalo de nuevo.');
      }
    }
  };

  // ===== WATCHERS =====
  // Sincronizar con el store
  watch(() => store.sortedByCategory.value, (newData: Producto[]) => {
    productsData.value = [...newData];
  });

  watch(() => store.categorias.value, (newData: Categoria[]) => {
    categoriesData.value = [...newData];
  });
</script>
<style scoped>
.shoppingList{
  background-color: #333;
  flex-grow: 1;
  text-align: center;
  height: 3.125rem;
  align-content: center;
}
.filaAcciones{
  align-items: center;
}
.listaCompra
{
  overflow-y: auto;
}
</style>