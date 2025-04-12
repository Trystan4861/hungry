import { computed } from "vue";
import type { ComputedRef, Ref } from "vue";
import type { Producto } from "~/types";
import { myStore } from "~/composables/useStore";
import { useProductFilter } from "~/composables/useProductFilter";

export function useProductList(orderType: 'a2z' | 'category' = 'a2z'): {
  store: ReturnType<typeof myStore>;
  showFinder: Ref<boolean>;
  idInput: string;
  finder: Ref<string>;
  filteredProducts: ComputedRef<Producto[]>;
  selectedProductsCount: ComputedRef<number>;
  toggleFinder: () => void;
  handleUpdateValue: (value: string) => void;
  handleUpdateSelected: (product: Producto) => void;
  handleUpdateAmount: (product: Producto, value: number) => void;
  pluralize: (n: number) => string;
} {
  const store = myStore();

  // Obtener los productos ordenados según el tipo de ordenación
  const productos = computed(() => {
    if (orderType === 'a2z') {
      return store.sortedA2Z.value;
    } else {
      return store.sortedByCategory.value;
    }
  });

  // Usar el composable de filtro de productos
  const {
    showFinder,
    idInput,
    finder,
    filteredProducts,
    toggleFinder,
    handleUpdateValue
  } = useProductFilter(() => productos.value);

  // Calcular el número de productos seleccionados
  const selectedProductsCount = computed(() =>
    store.productos.value.filter(product => product.selected).length
  );

  const pluralize = (n: number) => n === 1 ? "" : "s";

  const handleUpdateSelected = (product: Producto) => {
    store.toggleSelected(product.id);
  };

  const handleUpdateAmount = (product: Producto, value: number) => {
    store.setAmount(product.id, value);
  };

  return {
    store,
    showFinder,
    idInput,
    finder,
    filteredProducts,
    selectedProductsCount,
    toggleFinder,
    handleUpdateValue,
    handleUpdateSelected,
    handleUpdateAmount,
    pluralize
  };
}
