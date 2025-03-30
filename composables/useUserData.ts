import { ref } from 'vue';
import type { Ref } from 'vue';
import { myStore } from '~/composables/useStore';
import { apiService } from '~/services/apiService';
import type { ImportData } from '~/types';

/**
 * useUserData
 * Composable para obtener los datos del usuario actual desde el servidor
 * para compararlos con los datos locales y gestionar la sincronización
 * @returns Funciones y estados relacionados con los datos del usuario
 */
export function useUserData() {
  // Obtener la instancia del store
  const store = myStore();

  // Estados reactivos
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const serverData = ref<ImportData | null>(null);
  const lastFetchTime = ref<number | null>(null);

  /**
   * fetchUserData
   * Función para obtener todos los datos del usuario actual desde el servidor
   * Utiliza el endpoint getAll con método GET y envía el token por Bearer token
   * @returns Promesa que resuelve con los datos del usuario o rechaza con un error
   */
  const fetchUserData = async (): Promise<ImportData> => {
    // Verificar si el usuario está autenticado
    if (!store.loginData.value.logged || !store.loginData.value.token) {
      const errorMsg = 'No se puede obtener los datos del usuario sin iniciar sesión';
      error.value = errorMsg;
      console.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Llamar al método getAll del apiService
      // El token se enviará automáticamente como Bearer token gracias al interceptor configurado
      const response = await apiService.getAll();

      if (response.result) {
        // Transformar los datos recibidos al formato esperado por ImportData
        // La respuesta tiene una estructura diferente a la esperada
        const formattedData: ImportData = {
          // Añadir propiedades necesarias
          appName: 'Hungry!',
          lastChangeTimestamp: Date.now(),
          loginData: store.loginData.value,

          // Transformar categorías si es necesario
          categorias: response.categorias?.map((cat: {
            id_categoria: number;
            text: string;
            bgColor: string;
            visible: number;
            timestamp?: number;
          }) => ({
            id: cat.id_categoria,
            text: cat.text,
            bgColor: cat.bgColor,
            visible: cat.visible === 1,
            timestamp: cat.timestamp
          })) || [],

          // Usar productos directamente
          productos: response.productos || [],

          // Transformar supermercados si es necesario
          supermercados: response.supermercados?.map((sup: {
            id: number;
            text: string;
            logo: string;
            timestamp?: number;
          }) => ({
            id: sup.id,
            text: sup.text,
            logo: sup.logo,
            visible: true, // Por defecto todos visibles
            order: sup.id, // Usar id como orden por defecto
            timestamp: sup.timestamp
          })) || []
        };

        // Guardar los datos transformados
        serverData.value = formattedData;
        lastFetchTime.value = Date.now();
        return formattedData;
      } else {
        // Si la respuesta no es exitosa, establecer el error
        const errorMsg = response.error_msg || 'Error al obtener los datos del usuario';
        error.value = errorMsg;
        console.error('Error al obtener datos del usuario:', errorMsg);
        return Promise.reject(new Error(errorMsg));
      }
    } catch (err) {
      // Capturar cualquier error durante la petición
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al obtener datos del usuario';
      error.value = errorMsg;
      console.error('Error al obtener datos del usuario:', err);

      // Registrar información adicional para depuración
      if (err instanceof Error && err.stack) {
        console.error('Stack trace:', err.stack);
      }

      // Verificar si es un error de Axios para proporcionar mensajes más descriptivos
      const axiosError = err as { response?: { status: number, data?: any }, message?: string };
      if (axiosError.response) {
        console.error(`Error HTTP ${axiosError.response.status}:`, axiosError.response.data);
        if (axiosError.response.status === 404) {
          console.error('El endpoint getAll no existe en el servidor.');
        } else if (axiosError.response.status === 401) {
          console.error('No autorizado. El token puede haber expirado.');
          // Actualizar el estado de login si el token ha expirado
          store.loginData.value = {
            ...store.loginData.value,
            logged: false,
            token: ''
          };
        }
      } else if (axiosError.message && axiosError.message.includes('Network Error')) {
        console.error('Error de red. Verifica tu conexión a Internet.');
      }

      return Promise.reject(err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * compareData
   * Función para comparar los datos del servidor con los datos locales
   * @param serverData Datos obtenidos del servidor
   * @returns Objeto con las diferencias encontradas
   */
  const compareData = (serverData: ImportData): {
    hasChanges: boolean;
    serverNewer: boolean;
    differences: {
      productos: { local: number; server: number; };
      categorias: { local: number; server: number; };
      supermercados: { local: number; server: number; };
    };
  } => {
    // Obtener datos locales
    const localData = store.exportData();

    // Determinar qué datos son más recientes
    // Usamos una lógica simple: si hay datos en el servidor, asumimos que son más recientes
    // a menos que tengamos más productos localmente
    const localProductCount = localData.productos?.length || 0;
    const serverProductCount = serverData.productos?.length || 0;

    // Si hay productos en el servidor, asumimos que son más recientes
    // Si no hay productos en el servidor pero sí localmente, asumimos que los locales son más recientes
    const serverNewer = serverProductCount > 0 || localProductCount === 0;

    // Contar elementos en cada conjunto de datos
    const differences = {
      productos: {
        local: localProductCount,
        server: serverProductCount
      },
      categorias: {
        local: localData.categorias?.length || 0,
        server: serverData.categorias?.length || 0
      },
      supermercados: {
        local: localData.supermercados?.length || 0,
        server: serverData.supermercados?.length || 0
      }
    };

    // Determinar si hay diferencias significativas
    // Consideramos que hay cambios si:
    // 1. El número de elementos es diferente en alguna categoría
    // 2. Hay productos en el servidor pero no localmente o viceversa
    const hasChanges =
      differences.productos.local !== differences.productos.server ||
      differences.categorias.local !== differences.categorias.server ||
      differences.supermercados.local !== differences.supermercados.server ||
      (serverProductCount > 0 && localProductCount === 0) ||
      (localProductCount > 0 && serverProductCount === 0);

    return {
      hasChanges,
      serverNewer,
      differences
    };
  };

  return {
    fetchUserData,
    compareData,
    isLoading,
    error,
    serverData,
    lastFetchTime
  };
}