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
        @click="clearList" />
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
  import { ref, computed, watch, onMounted } from 'vue';
  import { myStore } from "~/composables/useStore";
  import { localStorageService } from "~/localStorageService";
  import { _DOM } from "~/utils";
  import Swal from 'sweetalert2';
  import type { Producto, Supermercado, Categoria } from '~/types';

  // Definición de la interfaz para el componente MySelect
  interface MySelectOption {
    id: number;
    text: string;
    [key: string]: any;
  }

  interface MySelectComponent {
    selectedOption: MySelectOption;
  }

  const lastClickTimeout = 400;


  const store = myStore();

  const productsData = ref<Producto[]>(store.productos.value);
  const categoriesData = ref<Categoria[]>(store.categorias.value);

  // Función para crear una copia de un array
  const createCopy = <T>(arr: T[]): T[] => JSON.parse(JSON.stringify(arr));

  // Función para encontrar el índice de un elemento por su ID
  const findIndexById = (id: number, arr: Array<{id: number}>): number =>
    arr.findIndex((item) => item.id === id);

  const supermarketAtShoppingList = ref<MySelectComponent | null>(null);
  const supermercadosVisibles = computed(() => store.supermercados.value.filter((i: Supermercado) => i.visible));

  // Función para filtrar supermercados
  const filterSupermercados = (): Supermercado[] => {
    let aux = createCopy(supermercadosVisibles.value);
    if (aux.length > 1) {
      aux = aux.filter((i: Supermercado) => i.id !== 0);
    }
    return aux;
  };

  const supermercadosAMostrar = computed(() => filterSupermercados());

  // Mantener el supermercado seleccionado en un ref para evitar cambios no deseados
  const selectedSupermarket = ref(supermercadosAMostrar.value[0]);

  const id_supermercado = computed(() => selectedSupermarket.value?.id ?? 0);
  const supermercado = computed(() => selectedSupermarket.value?.text ?? 'Cualquier Supermercado');

  // Watch for changes in the selected supermarket
  watch(() => id_supermercado.value, (newValue) => {
    console.log("Supermercado cambiado a:", newValue);
    // Esto activará un recálculo de las propiedades computadas
    // que dependen de id_supermercado
  });

  // Handle supermarket change from dropdown
  const handleSupermarketChange = (option: Supermercado) => {
    console.log("Supermercado seleccionado:", option);
    // Actualizar el supermercado seleccionado
    selectedSupermarket.value = option;
  };

  const idsCategoriasVisibles = computed(() =>
    createCopy(categoriesData.value)
      .filter((item: Categoria) => item.visible)
      .map((item: Categoria) => item.id)
  );

  const productosDeCategoriasVisibles = computed(() =>
    productsData.value.filter((producto: Producto) =>
      idsCategoriasVisibles.value.includes(producto.id_categoria)
    )
  );

  const productosSeleccionados = computed(() =>
    productosDeCategoriasVisibles.value.filter((item: Producto) => item.selected)
  );

  const amount2Buy = computed(() =>
    productosSeleccionados.value.filter((i: Producto) => !i.done).length
  );

  const amountBuyed = computed(() =>
    productosSeleccionados.value.length - amount2Buy.value
  );

  const lastClick = ref(Date.now());
  const isProcessingClick = ref(false);

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

  const anchoBotonLimpiarLista = ref('100px');

  // Lista de productos del supermercado actual (incluye los de "cualquier supermercado")
  const productosEnSupermercadoActual = computed(() =>
    productosSeleccionados.value.filter((item: Producto) =>
      (item.id_supermercado === id_supermercado.value || item.id_supermercado === 0)
      && !item.done
    )
  );

  // Lista de productos de otros supermercados
  const productosEnOtrosSupermercados = computed(() =>
    productosSeleccionados.value.filter((item: Producto) =>
      item.id_supermercado !== id_supermercado.value
      && item.id_supermercado !== 0
      && !item.done
    )
  );

  // Lista de productos comprados
  const productosComprados = computed(() =>
    productosSeleccionados.value.filter((item: Producto) => item.done)
  );

  const recalculateAnchoBotonLimpiarLista = (): void => {
    const element = _DOM(".nav-item:last-child");
    if (element && element.getClientRects && element.getClientRects()[0]) {
      anchoBotonLimpiarLista.value = (element.getClientRects()[0].width ?? 100) + 'px';
    } else {
      anchoBotonLimpiarLista.value = '100px';
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => setTimeout(recalculateAnchoBotonLimpiarLista, 50));
  }

  onMounted(() => setTimeout(recalculateAnchoBotonLimpiarLista, lastClickTimeout));

  const handleShoplistClick = (item: Producto, value: boolean): void => {
    // Check if we're already processing a click or if not enough time has passed
    if (isProcessingClick.value || Date.now() - lastClick.value < lastClickTimeout) {
      return; // Ignore this click
    }

    // Set processing flag to true
    isProcessingClick.value = true;

    // Update lastClick time
    lastClick.value = Date.now();

    // Process the click
    const index = findIndexById(item.id, productsData.value);
    if (index !== -1) {
      // Use the value from the event instead of toggling
      productsData.value[index].done = value;
      setProductsData(productsData.value);
    }

    // Reset processing flag after lastClickTimeout ms
    setTimeout(() => {
      isProcessingClick.value = false;
    }, lastClickTimeout);
  };

  const clearList = (): void => {
    const selectedProducts = productsData.value.filter((item: Producto) => item.selected);
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
        productsData.value.forEach((producto: Producto) => {
          if (producto.done) {
            producto.selected = false;
            producto.done = false;
          }
        });
      } else if (result.isConfirmed) {
        productsData.value.forEach((producto: Producto) => {
          producto.selected = false;
          producto.done = false;
        });
      }
      setProductsData(productsData.value);
    });
  };

  const setProductsData = (newData: Producto[]): void => {
    store.productos.value = newData;
    localStorageService.setItem(store.exportData());
  };

  watch(productsData, (newData: Producto[]) => setProductsData(newData));

  // Sincronizar con el store
  watch(() => store.productos.value, (newData: Producto[]) => {
    if (JSON.stringify(productsData.value) !== JSON.stringify(newData)) {
      productsData.value = newData;
    }
  });

  watch(() => store.categorias.value, (newData: Categoria[]) => {
    categoriesData.value = newData;
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