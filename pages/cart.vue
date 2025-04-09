<template>
  <div v-show="hayProductosSeleccionados">
    <div class="me-0 d-flex filaAcciones">
      <MySelect
        v-if="hayMultiplesSupermercados"
        class="flex-grow-1"
        ref="supermarketAtShoppingList"
        :options="supermercados"
        :selected="selectedSupermarket"
        @select="handleSupermarketChange"
      />
      <div v-else class="supermarketsAltLabel">LISTA DE LA COMPRA</div>
      <MyButton
        class="danger bold clearList"
        text="Limpiar Lista"
        :styleButton="{width: anchoBotonLimpiarLista, borderRadius:'0px'}"
        @click="handleClearList"
      />
    </div>
  </div>

  <!-- Contenedor principal de la lista de compra -->
  <div
    class="rounded-bottom listaCompra"
    :class="{ 'h-100': !hayProductosSeleccionados }"
  >
    <!-- Contador de productos por comprar -->
    <div
      v-show="hayProductosSeleccionados"
      class="text-end mt-2 me-2"
      :class="{ 'text-center': !hayMultiplesSupermercados }"
    >
      {{ amount2Buy }} producto{{ pluralizar(amount2Buy) }} por comprar
    </div>

    <!-- Mensaje cuando la lista está vacía -->
    <div v-show="!hayProductosSeleccionados" class="h-100">
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
      <div class="w-100 text-center">
        Puedes comprar en otros supermercados {{ AmountInOtherSupermarkets }} producto{{ pluralizar(AmountInOtherSupermarkets) }}
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
  const productsData = ref<Producto[]>(store.sortedByCategory.value);
  const categoriesData = ref<Categoria[]>(store.categorias.value);
  const lastClick = ref(Date.now());
  const isProcessingClick = ref(false);
  const anchoBotonLimpiarLista = ref('100px');

  /**
   * pluralizar
   * Devuelve 's' si el número es distinto de 1, o cadena vacía si es 1
   * @param num Número a evaluar
   * @returns Sufijo para pluralizar
   */
  const pluralizar = (num: number): string => num !== 1 ? 's' : '';

  // ===== GESTIÓN DE SUPERMERCADOS =====
  /**
   * Filtra los supermercados visibles, excluyendo el supermercado genérico (id=0)
   */
  const supermercados = computed(() =>
    store.supermercados.value
      .filter((i: Supermercado) => i.visible && i.id !== 0)
  );

  // Valor por defecto para cuando no hay supermercados seleccionados
  const defaultSupermarket: MySelectOption = { id: 0, text: 'Cualquier Supermercado' };

  const selectedSupermarket = ref<MySelectOption>(defaultSupermarket);
  const id_supermercado = computed(() => selectedSupermarket.value?.id ?? 0);
  const supermercado = computed(() => selectedSupermarket.value?.text ?? 'Cualquier Supermercado');

  // Inicializar el supermercado seleccionado cuando cambia la lista de supermercados
  watch(() => supermercados.value, (newSupermercados) => {
    // Si hay supermercados visibles, seleccionar el primero
    if (newSupermercados.length > 0) {
      // Verificar si el supermercado actualmente seleccionado sigue siendo visible
      const currentId = selectedSupermarket.value?.id;
      const currentIsVisible = newSupermercados.some(s => s.id === currentId);

      // Si el supermercado actual ya no es visible, seleccionar el primero de la lista
      if (!currentIsVisible) {
        selectedSupermarket.value = newSupermercados[0];
      }
    } else {
      // Si no hay supermercados visibles, usar el supermercado genérico
      selectedSupermarket.value = defaultSupermarket;
    }
  }, { immediate: true });

  // ===== FILTRADO DE PRODUCTOS =====
  // Productos seleccionados y contadores
  const productosSeleccionados = computed(() =>
    productsData.value.filter((item: Producto) => item.selected)
  );

  const productosPorComprar = computed(() =>
    productosSeleccionados.value.filter((item: Producto) => !item.done)
  );

  const amount2Buy = computed(() => productosPorComprar.value.length);
  const amountBuyed = computed(() => productosSeleccionados.value.length - amount2Buy.value);

  // Productos por supermercado
  const productosEnSupermercadoActual = computed(() =>
    productosPorComprar.value.filter((item: Producto) => {
      // Obtener el supermercado del producto
      const supermercadoProducto = store.findSupermercado(item.id_supermercado);

      // Si el supermercado está oculto o no existe, tratar como supermercado genérico
      const esSupermercadoOculto = !supermercadoProducto || !supermercadoProducto.visible;

      // Mostrar en el supermercado actual si:
      // 1. El producto es del supermercado actual
      // 2. El producto es del supermercado genérico (id=0)
      // 3. El supermercado del producto está oculto (tratarlo como genérico)
      return item.id_supermercado === id_supermercado.value ||
             item.id_supermercado === 0 ||
             esSupermercadoOculto;
    })
  );

  const productosEnOtrosSupermercados = computed(() =>
    productosPorComprar.value.filter((item: Producto) => {
      // Obtener el supermercado del producto
      const supermercadoProducto = store.findSupermercado(item.id_supermercado);

      // Si el supermercado está oculto o no existe, tratar como supermercado genérico
      const esSupermercadoOculto = !supermercadoProducto || !supermercadoProducto.visible;

      // Mostrar en otros supermercados solo si:
      // 1. El producto NO es del supermercado actual
      // 2. El producto NO es del supermercado genérico (id=0)
      // 3. El supermercado del producto está visible
      return item.id_supermercado !== id_supermercado.value &&
             item.id_supermercado !== 0 &&
             !esSupermercadoOculto;
    })
  );

  const productosComprados = computed(() =>
    productosSeleccionados.value.filter((item: Producto) => item.done)
  );

  // Contadores para la interfaz
  const AmountInThisSupermarket = computed(() => productosEnSupermercadoActual.value.length);
  const AmountInOtherSupermarkets = computed(() => productosEnOtrosSupermercados.value.length);

  // Flags para la interfaz
  const hayProductosSeleccionados = computed(() => productosSeleccionados.value.length > 0);
  const hayMultiplesSupermercados = computed(() => supermercados.value.length > 1);
  const mostrarProductosOtrosSupermercados = computed(() =>
    AmountInOtherSupermarkets.value > 0 && id_supermercado.value > 0
  );

  // ===== GESTIÓN DE LA INTERFAZ =====
  /**
   * recalculateAnchoBotonLimpiarLista
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
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(recalculateAnchoBotonLimpiarLista, 50);
  };

  // ===== MANEJADORES DE EVENTOS =====
  /**
   * handleSupermarketChange
   * Maneja el cambio de supermercado seleccionado
   * @param option Opción seleccionada en el dropdown
   */
  const handleSupermarketChange = (option: MySelectOption): void => {
    // Asignar la nueva opción seleccionada
    selectedSupermarket.value = option;

    // Forzar actualización de las listas de productos
    // Esto es necesario para que los computed se recalculen
    productsData.value = [...store.sortedByCategory.value];
  };

  /**
   * handleShoplistClick
   * Maneja el clic en un producto para marcarlo/desmarcarlo como comprado
   * @param item Producto sobre el que se ha hecho clic
   * @param value Nuevo valor para el estado "done" del producto
   */
  const handleShoplistClick = (item: Producto, value: boolean): void => {
    // Evitar procesamiento múltiple de clics
    if (isProcessingClick.value || Date.now() - lastClick.value < lastClickTimeout) return;

    isProcessingClick.value = true;
    lastClick.value = Date.now();

    try {
      // Actualizar el estado del producto
      const producto = store.findProducto(item.id);
      if (producto) {
        producto.done = value;
        store.updateProduct(item.id, { done: value });
        productsData.value = [...store.sortedByCategory.value];

        // Mostrar notificación solo si el producto se marcó como comprado
        if (value) {
          const notificationDuration = 500;
          const notificationId = Date.now();

          notify({
            id: notificationId,
            group: "buttons",
            text: `${item.text} ha sido marcado como comprado`,
            duration: notificationDuration,
            data: {
              buttonText: "Deshacer",
              buttonClass: "btn-danger",
              onClick: () => {
                const productoActualizado = store.findProducto(item.id);
                if (productoActualizado) {
                  productoActualizado.done = false;
                  store.updateProduct(item.id, { done: false });
                  productsData.value = [...store.sortedByCategory.value];
                }
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
      setTimeout(() => { isProcessingClick.value = false; }, lastClickTimeout);
    }
  };

  /**
   * handleClearList
   * Maneja el clic en el botón "Limpiar Lista"
   * Muestra un diálogo de confirmación y limpia la lista según la opción seleccionada
   */
  const handleClearList = async (): Promise<void> => {
    const selectedProducts = store.productos.value.filter((item: Producto) => item.selected);
    const productosComprados = selectedProducts.filter(item => item.done).length;
    const productosPendientes = selectedProducts.length - productosComprados;
    const hayProductosCompradosYPendientes = productosComprados > 0 && productosPendientes > 0;

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

    try {
      // Eliminar solo productos comprados
      if (result.isDenied) {
        store.clearList(true);
        productsData.value = [...store.sortedByCategory.value];
      }
      // Eliminar todos los productos
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

          if (!confirmacionAdicional.isConfirmed) return;
        }

        store.clearList(false);
        productsData.value = [...store.sortedByCategory.value];
      }
    } catch (error) {
      console.error('Error al limpiar la lista:', error);
      showError('Error', 'Ocurrió un error al limpiar la lista. Inténtalo de nuevo.');
    }
  };

  // ===== CICLO DE VIDA Y EVENTOS =====
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
    if (resizeTimeout) clearTimeout(resizeTimeout);
  });

  // ===== WATCHERS =====
  // Sincronizar con el store
  watch(() => store.sortedByCategory.value, (newData: Producto[]) => {
    productsData.value = [...newData];
  });

  watch(() => store.categorias.value, (newData: Categoria[]) => {
    categoriesData.value = [...newData];
  });
</script>
