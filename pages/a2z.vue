<template>
  <div>
    <div class="h-100" v-if="store.productos.value.length==0">
      <div class="d-flex justify-content-center align-items-center h-100"><h2 class="text-uppercase text-center">No hay productos dados de alta</h2></div>
    </div>
    <div v-else>
      <div class="d-flex justify-content-between">
        <div class="text-start mt-2">
          <MyButton v-if="!showFinder" btnClass="none" @click="toggleFinder">&#x1f50d;</MyButton>
          <MyInput
            v-else
            :id="idInput"
            class="border-0 ms-2"
            :style="'height: 24px;'"
            :showCross="true"
            :showEmpty="true"
            :autoFocus="true"
            :maxLength="20"
            v-model="finder"
            @updateValue="handleUpdateValue"
            @crossClick="toggleFinder"
            placeholder="Buscar producto"></MyInput>
        </div>
        <div class="text-end me-2 mt-2" @click="toggleFinder">{{ selectedProductsCount }} producto{{ pluralize(selectedProductsCount) }} seleccionado{{ pluralize(selectedProductsCount) }}</div>
      </div>
      <div class="withScroll" ref="withScrollRef">
        <MyProductList
          :product-list="filteredProducts"
          @update:selected="handleUpdateSelected"
          @update:amount="handleUpdateAmount"
        />
      </div>
    </div>
    <div class="letraActual" :class="{'active': true, 'show': showLetraActual}" ref="letraActualRef"><span>{{ letraActual }}</span></div>
  </div>
</template>

<script setup lang="ts">
import { myStore } from "~/composables/useStore";
import MyProductList from "~/components/MyProductList.vue";
import type { Producto } from "~/types";
import { ref, computed, watch, onMounted } from "vue";
import { normalizeText } from "~/utils/text";

const store = myStore();
const { sortedA2Z } = store;
const showFinder = ref(false);
const idInput = "finder";
const finder = ref("");
const filteredList = ref<Producto[]>([]);

// Referencias para la funcionalidad de letra actual
const withScrollRef = ref<HTMLElement | null>(null);
const letraActualRef = ref<HTMLElement | null>(null);
const letraActual = ref('');
const showLetraActual = ref(false);
const ocultaTooltipTimeout = ref<number | null>(null);

// Inicializar la lista filtrada con todos los productos
onMounted(() => {
  console.log("Inicializando lista filtrada con:", sortedA2Z.value.length, "productos");
  filteredList.value = [...sortedA2Z.value];

  // Configurar el evento de scroll para actualizar la letra actual
  if (withScrollRef.value) {
    withScrollRef.value.addEventListener('scroll', updateTooltip, { passive: true });
  }
});

// Manejar la actualización del valor del input
const handleUpdateValue = (value: string) => {
  finder.value = value;
  updateFilter();
};

// Actualizar la lista filtrada cuando cambia el texto de búsqueda
const updateFilter = () => {
  console.log("Actualizando filtro con texto:", finder.value);

  if (!finder.value.trim()) {
    console.log("Texto vacío, mostrando todos los productos");
    filteredList.value = [...sortedA2Z.value];
    return;
  }

  const normalizedSearch = normalizeText(finder.value);
  console.log("Texto normalizado para búsqueda:", normalizedSearch);

  // Filtrar productos que contengan el texto de búsqueda (insensible a mayúsculas/minúsculas y acentos)
  const filtered = sortedA2Z.value.filter(product => {
    const normalizedProductText = normalizeText(product.text);
    const match = normalizedProductText.includes(normalizedSearch);
    if (match) {
      console.log(`Producto coincide: "${product.text}" (normalizado: "${normalizedProductText}")`);
    }
    return match;
  });

  console.log(`Filtrado completado: ${filtered.length} productos coinciden de ${sortedA2Z.value.length}`);
  filteredList.value = filtered;
};

// Usar la lista filtrada para mostrar los productos
const filteredProducts = computed(() => {
  console.log(`Devolviendo ${filteredList.value.length} productos filtrados`);
  return filteredList.value;
});

// Calcular el número de productos seleccionados
const selectedProductsCount = computed(() =>
  store.productos.value.filter(product => product.selected).length
);

// Actualizar la lista filtrada cuando cambia la lista de productos
watch(() => sortedA2Z.value, () => {
  console.log("La lista de productos ha cambiado, actualizando filtro");
  updateFilter();
}, { deep: true });

const toggleFinder = () => {
  showFinder.value = !showFinder.value;
  console.log("Buscador:", showFinder.value ? "abierto" : "cerrado");

  if (!showFinder.value) {
    finder.value = "";
    filteredList.value = [...sortedA2Z.value];
    console.log("Buscador cerrado, restableciendo lista completa");
  }
};

const pluralize = (n: number) => n === 1 ? "" : "s";

const handleUpdateSelected = (product: Producto) => {
  store.toggleSelected(product.id);
};

const handleUpdateAmount = (product: Producto, value: number) => {
  store.setAmount(product.id, value);
};

// Funciones para la letra actual
const muestraOcultaTooltip = () => {
  showLetraActual.value = !showLetraActual.value;
};

const updateTooltip = () => {
  if (!withScrollRef.value || !letraActualRef.value) return;

  const productos = withScrollRef.value.querySelectorAll(".productText");
  for (let producto of productos) {
    if (producto.getBoundingClientRect().top < letraActualRef.value.getBoundingClientRect().top) continue;
    const productName = producto.querySelector(".productName");
    if (productName && productName.textContent) {
      letraActual.value = productName.textContent[0].toUpperCase();
      break;
    }
  }

  if (!showLetraActual.value) {
    muestraOcultaTooltip();
    if (ocultaTooltipTimeout.value !== null) {
      clearTimeout(ocultaTooltipTimeout.value);
    }
    ocultaTooltipTimeout.value = setTimeout(muestraOcultaTooltip, 1000) as unknown as number;
  }
};
</script>

<style scoped>
.selected {
  font-weight: bold;
  color: #42b983;
}

.withScroll {
  --height: 88vh;
  --height-modifier: 50px;
  overflow-y: auto;
  height: calc(var(--height) - var(--height-modifier));
  margin-top: 10px;
}

.letraActual {
  display: none;
  position: fixed;
  bottom: 50%;
  left: 100%;
  margin-left: -30px;
  background-color: #ccc;
  color: #333;
  font-weight: bold;
  width: 10vmin;
  height: 10vmin;
  justify-content: center;
  align-items: center;
  translate: -100%;
  border-radius: 1cap;
  -webkit-box-shadow: 10px 10px 20px 0px rgba(0,0,0,0.75);
  -moz-box-shadow: 10px 10px 20px 0px rgba(0,0,0,0.75);
  box-shadow: 10px 10px 20px 0px rgba(0,0,0,0.75);
  transition: all 1s ease;
  z-index: 1000;
}

.letraActual:after {
  content: '';
  position: absolute;
  right: -10px;
  border-style: solid;
  border-width: 10px 0 10px 14px;
  border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) #ccc;
}

.letraActual span {
  font-size: 1.5625rem;
}

.active.show {
  display: flex;
}
</style>
