<template>
  <div class="h-100" v-if="productos.length==0">
    <div class="d-flex justify-content-center align-items-center h-100"><h2 class="text-uppercase text-center">No hay productos dados de alta</h2></div>
  </div>
  <div v-else>
    <div class="d-flex justify-content-between">
      <div class="text-start mt-2">
        <MyButton v-if="!showFinder" class="none" @click="toggleFinder">&#x1f50d;</MyButton>
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
        :showEdit="showEdit"
        @update:selected="handleUpdateSelected"
        @update:amount="handleUpdateAmount"
        @click:edit="handleEdit"
      />
    </div>
  </div>
  <div v-if="props.showLetraActual" class="letraActual" :class="{'active': true, 'show': showLetraActual}" ref="letraActualRef"><span>{{ letraActual }}</span></div>
</template>

<script setup lang="ts">
import { myStore } from "~/composables/useStore";
import MyProductList from "~/components/MyProductList.vue";
import type { Producto } from "~/types";
import { ref, computed, watch, onMounted } from "vue";
import { normalizeText } from "~/utils/text";
import '~/css/components/MyProductListView.css';

const props = defineProps({
  // Tipo de ordenación: 'a2z' (alfabético) o 'category' (por categoría)
  showEdit: { type: Boolean, default: false },
  showLetraActual: { type: Boolean, default: false },
  orderType: {
    type: String,
    default: 'a2z',
    validator: (value: string) => ['a2z', 'category'].includes(value)
  }
});
const emit = defineEmits(["edit"]);
const handleEdit = (product: Producto) => {
  emit("edit", product);
};
const store = myStore();
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

// Obtener los productos ordenados según el tipo de ordenación
const productos = computed(() => {
  if (props.orderType === 'a2z') {
    return store.sortedA2Z.value;
  } else {
    // Ordenar por categoría y luego alfabéticamente dentro de cada categoría
    return store.sortedByCategory.value;
  }
});

// Inicializar la lista filtrada con todos los productos
onMounted(() => {
  filteredList.value = [...productos.value];
  // Configurar el evento de scroll para actualizar la letra actual solo si showLetraActual es true
  if (props.showLetraActual && withScrollRef.value) {
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
  if (!finder.value.trim()) {
    filteredList.value = [...productos.value];
    return;
  }

  const normalizedSearch = normalizeText(finder.value);

  // Filtrar productos que contengan el texto de búsqueda (insensible a mayúsculas/minúsculas y acentos)
  const filtered = productos.value.filter(product => {
    const normalizedProductText = normalizeText(product.text);
    const match = normalizedProductText.includes(normalizedSearch);
    return match;
  });

  filteredList.value = filtered;
};

// Usar la lista filtrada para mostrar los productos
const filteredProducts = computed(() => {
  return filteredList.value;
});

// Calcular el número de productos seleccionados
const selectedProductsCount = computed(() =>
  store.sortedA2Z.value.filter(product => product.selected).length
);

// Actualizar la lista filtrada cuando cambia la lista de productos
watch(() => productos.value, () => {
  updateFilter();
}, { deep: true });

const toggleFinder = () => {
  showFinder.value = !showFinder.value;
  if (!showFinder.value) {
    finder.value = "";
    filteredList.value = [...productos.value];
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
  if (!props.showLetraActual) return;
  showLetraActual.value = !showLetraActual.value;
};

const updateTooltip = () => {
  if (!props.showLetraActual || !withScrollRef.value || !letraActualRef.value) return;

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


