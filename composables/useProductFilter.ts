import { ref, computed, watch } from "vue";
import type { Producto } from "~/types";
import { normalizeText } from "~/utils/text";

export function useProductFilter(getProducts: () => Producto[]) {
  const showFinder = ref(false);
  const idInput = "finder";
  const finder = ref("");
  const filteredList = ref<Producto[]>([]);

  // Inicializar la lista filtrada
  const initFilteredList = () => {
    console.log(`Inicializando lista filtrada con: ${getProducts().length} productos`);
    filteredList.value = [...getProducts()];
  };

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
      filteredList.value = [...getProducts()];
      return;
    }

    const normalizedSearch = normalizeText(finder.value);
    console.log("Texto normalizado para búsqueda:", normalizedSearch);

    // Filtrar productos que contengan el texto de búsqueda (insensible a mayúsculas/minúsculas y acentos)
    const filtered = getProducts().filter(product => {
      const normalizedProductText = normalizeText(product.text);
      const match = normalizedProductText.includes(normalizedSearch);
      if (match) {
        console.log(`Producto coincide: "${product.text}" (normalizado: "${normalizedProductText}")`);
      }
      return match;
    });

    console.log(`Filtrado completado: ${filtered.length} productos coinciden de ${getProducts().length}`);
    filteredList.value = filtered;
  };

  // Usar la lista filtrada para mostrar los productos
  const filteredProducts = computed(() => {
    console.log(`Devolviendo ${filteredList.value.length} productos filtrados`);
    return filteredList.value;
  });

  // Actualizar la lista filtrada cuando cambia la lista de productos
  watch(() => getProducts(), () => {
    console.log("La lista de productos ha cambiado, actualizando filtro");
    updateFilter();
  }, { deep: true });

  const toggleFinder = () => {
    showFinder.value = !showFinder.value;
    console.log("Buscador:", showFinder.value ? "abierto" : "cerrado");

    if (!showFinder.value) {
      finder.value = "";
      filteredList.value = [...getProducts()];
      console.log("Buscador cerrado, restableciendo lista completa");
    }
  };

  // Inicializar la lista filtrada
  initFilteredList();

  return {
    showFinder,
    idInput,
    finder,
    filteredProducts,
    toggleFinder,
    handleUpdateValue,
    updateFilter
  };
}
