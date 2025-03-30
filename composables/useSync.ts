import { ref } from 'vue';
import type { Ref } from 'vue';
import { myStore } from '~/composables/useStore';
import { apiService } from '~/services/apiService';

/**
 * useSync
 * Composable para gestionar la sincronización de datos con el servidor
 * @returns Funciones y estados relacionados con la sincronización
 */
// Definir la interfaz para la respuesta de la API
// Definir el tipo para los datos exportados
import type { ImportData } from '~/types';

interface ApiResponse {
  result: boolean;
  error_msg?: string;
  data?: ImportData;
  token?: string;
}

export function useSync(): {
  syncWithServer: () => Promise<boolean>;
  isSyncing: Ref<boolean>;
  lastSyncTime: Ref<number | null>;
  syncStatus: Ref<'idle' | 'syncing' | 'success' | 'error'>;
} {
  // Obtener la instancia del store
  const store = myStore();
  const isSyncing = ref(false);
  const lastSyncTime = ref<number | null>(null);
  const syncStatus = ref<'idle' | 'syncing' | 'success' | 'error'>('idle');

  /**
   * syncWithServer
   * Función para sincronizar datos con el servidor
   * @returns Promesa que resuelve a true si la sincronización fue exitosa
   */
  const syncWithServer = async (): Promise<boolean> => {
    if (!store.loginData.value.logged) {
      console.error('No se puede sincronizar sin iniciar sesión');
      return false;
    }

    try {
      isSyncing.value = true;
      syncStatus.value = 'syncing';

      // Obtener datos del servidor
      // Obtenemos los datos a sincronizar
      const dataToSync = store.exportData();

      // Eliminamos loginData de los datos a sincronizar
      // No se deben enviar los datos de loginData en el JSON a sincronizar
      if ('loginData' in dataToSync) {
        delete dataToSync.loginData;
      }

      const response: ApiResponse = await apiService.syncData(
        store.loginData.value.email,
        store.loginData.value.token,
        store.loginData.value.fingerID,
        dataToSync
      );

      if (response.result) {
        // Actualizar datos locales con los del servidor
        if (response.data) {
          // Actualizar datos locales con los del servidor
          store.importData(response.data);
        }

        // Actualizar estado de sincronización
        lastSyncTime.value = Date.now();
        syncStatus.value = 'success';
        return true;
      } else {
        console.error('Error en sincronización:', response.error_msg);
        syncStatus.value = 'error';
        return false;
      }
    } catch (error) {
      console.error('Error en sincronización:', error);
      syncStatus.value = 'error';

      // Registrar información adicional para depuración
      if (error instanceof Error) {
        console.error('Detalles del error:', error.message);
        if (error.stack) {
          console.error('Stack trace:', error.stack);
        }
      }

      // Verificar si es un error de Axios para proporcionar mensajes más descriptivos
      const axiosError = error as { response?: { status: number, data?: any }, message?: string };
      if (axiosError.response) {
        console.error(`Error HTTP ${axiosError.response.status}:`, axiosError.response.data);
        if (axiosError.response.status === 404) {
          console.error('El endpoint de sincronización no existe en el servidor.');
        } else if (axiosError.response.status === 401) {
          console.error('No autorizado. El token puede haber expirado.');
        }
      } else if (axiosError.message && axiosError.message.includes('Network Error')) {
        console.error('Error de red. Verifica tu conexión a Internet.');
      }

      return false;
    } finally {
      isSyncing.value = false;
    }
  };

  return {
    syncWithServer,
    isSyncing,
    lastSyncTime,
    syncStatus
  };
}