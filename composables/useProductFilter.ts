import { ref, computed, watch } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { Producto } from "~/types";
import { normalizeText } from "~/utils/text";

export function useProductFilter(getProducts: () => Producto[]): {
  showFinder: Ref<boolean>;
  idInput: string;
  finder: Ref<string>;
  filteredProducts: ComputedRef<Producto[]>;
  toggleFinder: () => void;
  handleUpdateValue: (value: string) => void;
  updateFilter: () => void;
} {
  const showFinder = ref(false);
  const idInput = "finder";
  const finder = ref("");
  const filteredList = ref<Producto[]>([]);

  // Inicializar la lista filtrada
  const initFilteredList = () => {
    filteredList.value = [...getProducts()];
  };

  // Manejar la actualización del valor del input
  const handleUpdateValue = (value: string) => {
    finder.value = value;
    updateFilter();
  };

  // Actualizar la lista filtrada cuando cambia el texto de búsqueda
  const updateFilter = () => {

    if (!finder.value.trim()) {
      filteredList.value = [...getProducts()];
      return;
    }

    const normalizedSearch = normalizeText(finder.value);

    // Filtrar productos que contengan el texto de búsqueda (insensible a mayúsculas/minúsculas y acentos)
    const filtered = getProducts().filter(product => {
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

  // Actualizar la lista filtrada cuando cambia la lista de productos
  watch(() => getProducts(), () => {
    updateFilter();
  }, { deep: true });

  const toggleFinder = () => {
    showFinder.value = !showFinder.value;

    if (!showFinder.value) {
      finder.value = "";
      filteredList.value = [...getProducts()];
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
