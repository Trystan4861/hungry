<template>
  <div  v-show="productosSeleccionados.length>0">
      <div class="me-0 d-flex filaAcciones">
        <MySelect
        class="flex-grow-1"
        ref="supermarketAtShoppingList"
        :options="supermercadosAMostrar"
        :selected="selectedSupermarket"
        v-show="supermercadosVisibles.length > 1"
        @select="handleSupermarketChange"
        />
        <div class="shoppingList" v-show="supermercadosVisibles.length == 1">LISTA DE LA COMPRA</div>
        <MyButton
        class="danger bold clearList"
        text="Limpiar Lista"
        :styleButton="{width: anchoBotonLimpiarLista,borderRadius:'0px'}"
        @click="handleClearList" />
      </div>
    </div>
    <div
    class="rounded-bottom listaCompra"
    :class="{ 'h-100': productosSeleccionados.length==0 }"
    >
      <div class="text-end mt-2 me-2" v-show="productosSeleccionados.length>0">{{ amount2Buy }} producto{{ amount2Buy!=1?'s':'' }} por comprar</div>
      <div class="h-100" v-show="productosSeleccionados.length==0">
        <div class="d-flex justify-content-center align-items-center h-100"><h2 class="text-uppercase text-center">La lista de la compra está vacía</h2></div>
      </div>
      <div v-show="AmountInThisSupermarket>0"
        >
        <div class="w-100 text-center mt-2">Puedes comprar en {{ supermercado }}: {{ AmountInThisSupermarket }} producto{{ AmountInThisSupermarket>1?'s':'' }}<hr /></div>
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
      <div v-show="AmountInOtherSupermarkets>0 && supermercadosVisibles.length > 1">
        <div class="w-100 text-center" v-if="supermercadosAMostrar.length>1">Puedes comprar en otros Supermercados: {{ AmountInOtherSupermarkets }} producto{{ AmountInOtherSupermarkets>1?'s':'' }}<hr /></div>
        <div class="w-100 text-center" v-else>En Supermercados ocultos: {{ AmountInOtherSupermarkets }} producto{{ AmountInOtherSupermarkets>1?'s':'' }}<hr /></div>
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
      <div v-show="amountBuyed>0">
        <div class="w-100 text-center">Productos comprados: {{ amountBuyed }} producto{{ amountBuyed!=1?'s':'' }}<hr /></div>
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
  import { ref, computed, watch, onMounted } from 'vue';
  import { myStore } from "~/composables/useStore";
  import { _DOM } from "~/utils";
  import { createCopy } from "~/utils/array";
  import { showErrorAlert as showError } from "~/utils/sweetalert";
  import Swal from 'sweetalert2';
  import type { Producto, Supermercado, Categoria, MySelectOption } from '~/types';

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

  // ===== GESTIÓN DE SUPERMERCADOS =====
  // Filtrado de supermercados
  const supermercadosVisibles = computed(() =>
    store.supermercados.value.filter((i: Supermercado) => i.visible)
  );

  /**
   * filterSupermercados
   * Filtra los supermercados visibles, excluyendo el supermercado genérico (id=0)
   * cuando hay más de un supermercado
   * @returns Array de supermercados filtrados
   */
  const filterSupermercados = (): Supermercado[] => {
    let aux = createCopy(supermercadosVisibles.value);
    if (aux.length > 1) {
      aux = aux.filter((i: Supermercado) => i.id !== 0);
    }
    return aux;
  };

  const supermercadosAMostrar = computed(() => filterSupermercados());
  const selectedSupermarket = ref<MySelectOption>(supermercadosAMostrar.value[0]);
  const id_supermercado = computed(() => selectedSupermarket.value?.id ?? 0);
  const supermercado = computed(() => selectedSupermarket.value?.text ?? 'Cualquier Supermercado');

  /**
   * handleSupermarketChange
   * Maneja el cambio de supermercado seleccionado
   * @param option Opción seleccionada en el dropdown
   */
  const handleSupermarketChange = (option: MySelectOption) => {
    selectedSupermarket.value = option;
  };

  // ===== FILTRADO DE PRODUCTOS =====
  // Productos seleccionados (en la lista de la compra)
  const productosSeleccionados = computed(() =>
    productsData.value.filter((item: Producto) => item.selected)
  );

  // Contadores para la interfaz
  const amount2Buy = computed(() =>
    productosSeleccionados.value.filter((i: Producto) => !i.done).length
  );

  const amountBuyed = computed(() =>
    productosSeleccionados.value.length - amount2Buy.value
  );

  const AmountInThisSupermarket = computed(() =>
    productosSeleccionados.value.filter((item: Producto) =>
      item.selected
      && (item.id_supermercado === id_supermercado.value || item.id_supermercado === 0)
      && !item.done
    ).length
  );

  const AmountInOtherSupermarkets = computed(() =>
    amount2Buy.value - AmountInThisSupermarket.value
  );

  // Listas filtradas para la interfaz
  const productosEnSupermercadoActual = computed(() =>
    productosSeleccionados.value.filter((item: Producto) =>
      (item.id_supermercado === id_supermercado.value || item.id_supermercado === 0)
      && !item.done
    )
  );

  const productosEnOtrosSupermercados = computed(() =>
    productosSeleccionados.value.filter((item: Producto) =>
      item.id_supermercado !== id_supermercado.value
      && item.id_supermercado !== 0
      && !item.done
    )
  );

  const productosComprados = computed(() =>
    productosSeleccionados.value.filter((item: Producto) => item.done)
  );

  // ===== GESTIÓN DE LA INTERFAZ =====
  /**
   * recalculateAnchoBotonLimpiarLista
   * Recalcula el ancho del botón "Limpiar Lista" para que coincida con el ancho del último elemento nav
   */
  const recalculateAnchoBotonLimpiarLista = (): void => {
    const element = _DOM(".nav-item:last-child");
    if (element && element.getClientRects && element.getClientRects()[0]) {
      anchoBotonLimpiarLista.value = (element.getClientRects()[0].width ?? 100) + 'px';
    } else {
      anchoBotonLimpiarLista.value = '100px';
    }
  };

  // Configuración de eventos
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => setTimeout(recalculateAnchoBotonLimpiarLista, 50));
  }

  onMounted(() => setTimeout(recalculateAnchoBotonLimpiarLista, lastClickTimeout));

  // ===== MANEJADORES DE EVENTOS =====
  /**
   * handleShoplistClick
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
   * handleClearList
   * Maneja el clic en el botón "Limpiar Lista"
   * Muestra un diálogo de confirmación y limpia la lista según la opción seleccionada
   */
  const handleClearList = (): void => {
    const selectedProducts = store.productos.value.filter((item: Producto) => item.selected);
    const auxClearList = selectedProducts.some((item: Producto) => item.done) &&
                         !selectedProducts.every((item: Producto) => item.done);

    Swal.fire({
      title: `Atención`,
      text: auxClearList ? '¿Qué elementos desea eliminar?' : 'Esto limpiará la lista de la compra',
      showCancelButton: true,
      confirmButtonText: auxClearList ? 'Todos' : 'Aceptar',
      denyButtonText: 'Ya Comprados',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-danger me-2',
        denyButton: 'btn btn-warning me-2',
        cancelButton: 'btn btn-success',
      },
      showDenyButton: auxClearList,
      buttonsStyling: false,
      target: _DOM("#swallDestination") as HTMLElement,
    }).then((result) => {
      if (result.isDenied) {
        // Limpiar solo los productos comprados
        try {
          store.clearList(true);
          // Forzar actualización de la vista
          productsData.value = [...store.sortedByCategory.value];
        } catch (error) {
          console.error('Error al limpiar productos comprados:', error);
          showError('Error', 'Ocurrió un error al limpiar la lista. Inténtalo de nuevo.');
        }
      } else if (result.isConfirmed) {
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
    });
  };

  // ===== WATCHERS =====
  // Sincronizar con el store
  watch(() => store.sortedByCategory.value, (newData: Producto[]) => {
    // Actualizar siempre para asegurar que la vista se refresca
    productsData.value = [...newData];
  }, { deep: true });

  watch(() => store.categorias.value, (newData: Categoria[]) => {
    categoriesData.value = [...newData];
  }, { deep: true });
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