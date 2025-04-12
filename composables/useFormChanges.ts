import { ref } from 'vue';
import type { Ref } from 'vue';
import type { FormChanges } from '~/types/ui/form';
import { showSuccess } from '~/utils/sweetalert';

/**
 * useFormChanges
 * Composable para gestionar los cambios en formularios
 *
 * Este composable permite rastrear qué campos de un formulario han sido modificados,
 * facilitando la implementación de funcionalidades como "guardar solo lo que cambió"
 * o "detectar si hay cambios sin guardar".
 *
 * @param initialState Estado inicial del formulario con todos los campos establecidos en false
 * @returns Objeto con funciones y estados para gestionar los cambios:
 *   - changes: Referencia reactiva al estado de los cambios
 *   - markAsChanged: Función para marcar un campo como modificado
 *   - hasChanges: Función que verifica si hay cambios pendientes
 *   - resetChanges: Función para restablecer el estado de los cambios
 *   - saveChanges: Función para guardar los cambios utilizando callbacks
 */
export function useFormChanges<T extends Record<string, boolean>>(initialState: T): FormChanges<T> {
  // Referencia a los cambios pendientes de guardar
  const changes = ref<T>({ ...initialState }) as Ref<T>;

  /**
   * markAsChanged
   * Marca un campo como modificado
   * @param field Nombre del campo modificado
   */
  const markAsChanged = (field: keyof T) => {
    changes.value[field] = true as T[keyof T];
  };

  /**
   * hasChanges
   * Verifica si hay cambios pendientes de guardar
   * @returns Booleano indicando si hay cambios
   */
  const hasChanges = (): boolean => {
    return Object.values(changes.value).some(value => value);
  };

  /**
   * resetChanges
   * Restablece el estado de los cambios
   */
  const resetChanges = () => {
    for (const key in changes.value) {
      // Usar una aserción de tipo más específica
      changes.value[key as keyof T] = false as T[keyof T];
    }
  };

  /**
   * saveChanges
   * Guarda los cambios y muestra un mensaje de éxito
   * @param saveCallbacks Objeto con funciones de guardado para cada campo
   */
  const saveChanges = (saveCallbacks: Record<keyof T, () => void>) => {
    if (hasChanges()) {
      // Ejecutar las funciones de guardado para los campos modificados
      for (const key in changes.value) {
        if (changes.value[key] && saveCallbacks[key]) {
          saveCallbacks[key]();
        }
      }

      // Mostrar mensaje de éxito
      showSuccess(
        'Cambios guardados',
        'Los cambios se han guardado correctamente',
        1500
      );

      // Resetear los cambios
      resetChanges();
    }
  };

  return {
    changes,
    markAsChanged,
    hasChanges,
    resetChanges,
    saveChanges
  };
}