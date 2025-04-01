import { ref, watch } from 'vue';
import type { Ref } from 'vue';

/**
 * useDraggable
 * Composable para gestionar elementos arrastrables
 * @param initialItems Lista inicial de elementos
 * @param options Opciones de configuración
 * @returns Funciones y estados relacionados con el arrastre
 */
export function useDraggable<T extends { id: number }>(
  initialItems: T[],
  options: {
    fixedFirstItem?: boolean;
    onOrderChange?: (items: T[]) => void;
  } = {}
) {
  // Opciones por defecto
  const { fixedFirstItem = false, onOrderChange } = options;

  // Referencia a los elementos ordenados
  const orderedItems = ref([...initialItems]) as Ref<T[]>;

  // Definir la interfaz para el evento de arrastre
  interface DraggableEvent {
    oldIndex: number;
    newIndex: number;
    preventDefault: () => void;
    draggedContext: {
      element: T;
      index: number;
    };
    relatedContext: {
      element: T;
      index: number;
    };
  }

  /**
   * onDragStart
   * Función que se ejecuta al iniciar el arrastre
   * @param evt Evento de arrastre
   */
  const onDragStart = (evt: DraggableEvent) => {
    if (fixedFirstItem) {
      // Verificar si el elemento que se está arrastrando es el primero
      const itemId = orderedItems.value[evt.oldIndex].id;
      if (itemId === 0) {
        // Cancelar el arrastre si es el primer elemento
        evt.preventDefault();
      }
    }
  };

  /**
   * onDragEnd
   * Función que se ejecuta al finalizar el arrastre
   * @param evt Evento de arrastre
   */
  const onDragEnd = (evt: DraggableEvent) => {
    // Llamar a la función de cambio de orden si se proporciona
    if (onOrderChange) {
      onOrderChange(orderedItems.value);
    }
  };

  /**
   * checkMove
   * Función para verificar si un movimiento es válido
   * @param evt Evento de arrastre
   * @returns Booleano indicando si el movimiento es válido
   */
  const checkMove = (evt: DraggableEvent): boolean => {
    if (fixedFirstItem) {
      // No permitir mover elementos a la posición 0 (antes del primer elemento)
      if (evt.draggedContext.element.id === 0 || evt.relatedContext.index === 0) {
        return false;
      }
    }
    return true;
  };

  // Observar cambios en los elementos iniciales
  watch(
    () => [...initialItems], // Crear una copia para asegurar que se detecten los cambios
    (newItems) => {
      orderedItems.value = [...newItems];
    },
    { deep: true }
  );

  return {
    orderedItems,
    onDragStart,
    onDragEnd,
    checkMove
  };
}