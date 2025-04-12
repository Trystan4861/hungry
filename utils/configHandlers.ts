import { myStore } from '~/composables/useStore';
import { showErrorSwal as showError, showLoading, showSuccess, closeSwal, showSyncConfirm, showSyncSuccess } from '~/utils/sweetalert';
import type { ImportData, Producto, Categoria, Supermercado } from '~/types';

/**
 * handleLastCheckedDeletionAttempt
 * Muestra un mensaje de error cuando se intenta eliminar la última categoría visible
 * @param value - Valor que se intentó eliminar (no utilizado en esta implementación)
 */
export const handleLastCheckedDeletionAttempt = (value?: number): void => {
  showError(
    'Error',
    "Al menos una categoría debe permanecer visible"
  );
};

/**
 * handleSync
 * Función para sincronizar manualmente los datos con el servidor
 * @param store - Instancia del store
 * @param fetchUserData - Función para obtener datos del usuario
 * @param compareData - Función para comparar datos
 * @param syncWithServer - Función para sincronizar con el servidor
 * @returns Promesa que se resuelve cuando finaliza la sincronización
 */
export const handleSync = async (
  store: ReturnType<typeof myStore>,
  fetchUserData: () => Promise<ImportData>,
  compareData: (serverData: ImportData) => {
    hasChanges: boolean;
    serverNewer: boolean;
    differences: {
      productos: { local: number; server: number; };
      categorias: { local: number; server: number; };
      supermercados: { local: number; server: number; };
    };
  },
  syncWithServer: () => Promise<boolean>
): Promise<boolean> => {
  // Verificar si el usuario está autenticado
  if (!store.loginData.value.logged) {
    showError(
      'Error',
      "Debes iniciar sesión para sincronizar datos"
    );
    return false;
  }

  // Mostrar diálogo de carga
  const loadingDialog = showLoading(
    'Obteniendo datos',
    'Obteniendo datos del servidor...'
  );

  try {
    // Obtener datos del servidor
    const serverData = await fetchUserData();

    // Cerrar diálogo de carga
    closeSwal();

    // Comparar datos del servidor con datos locales
    const comparison = compareData(serverData);

    if (!comparison.hasChanges) {
      // Si no hay diferencias, mostrar mensaje
      showSuccess(
        'Sincronización completada',
        'Tus datos ya están sincronizados con el servidor'
      );
      return true;
    }

    // Si hay diferencias, mostrar diálogo para que el usuario decida
    const { serverNewer, differences } = comparison;

    // Construir mensaje con las diferencias
    const diffMessage = `
      <p>Se han encontrado diferencias entre tus datos locales y los del servidor,
      <b>${serverNewer ? 'los datos del servidor' : 'tus datos locales'} son más recientes.</b></p>
      <p><h3>¿Qué deseas hacer?</h3></p>
    `;

    const result = await showSyncConfirm(diffMessage);

    if (result.isConfirmed) {
      // Enviar datos locales al servidor
      const syncResult = await syncWithServer();
      if (syncResult) {
        showSyncSuccess(
          'Sincronizado',
          'Tus datos se han enviado al servidor correctamente'
        );
        return true;
      } else {
        showError(
          'Error',
          'No se pudieron sincronizar los datos con el servidor'
        );
        return false;
      }
    } else if (result.isDenied) {
      // Usar datos del servidor
      store.importData(serverData);
      showSyncSuccess(
        'Sincronizado',
        'Se han cargado los datos del servidor'
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error en sincronización:', error);
    closeSwal();
    showError(
      'Error de sincronización',
      'Ocurrió un error al obtener los datos del servidor. Inténtalo de nuevo más tarde.'
    );
    return false;
  }
};

export const compareData = (serverData: ImportData) => {
  const store = myStore();
  const localData = store.exportData();

  // Función para comparar timestamps
  const isNewer = (a: string, b: string) => new Date(a) > new Date(b);

  const compareItems = <T extends { id: number; timestamp?: string }>(local: T[], server: T[]) => {
    const conflicts = server.filter(sItem => {
      const lItem = local.find(l => l.id === sItem.id);
      return lItem && lItem.timestamp && sItem.timestamp &&
             lItem.timestamp !== sItem.timestamp;
    });

    return {
      count: server.length,
      conflicts: conflicts.length,
      newer: conflicts.some(sItem => {
        const lItem = local.find(l => l.id === sItem.id);
        return lItem && sItem.timestamp && lItem.timestamp &&
               isNewer(sItem.timestamp, lItem.timestamp);
      })
    };
  };

  const productosComp = compareItems<Producto>(localData.productos || [], serverData.productos || []);
  const categoriasComp = compareItems<Categoria>(localData.categorias || [], serverData.categorias || []);
  const supermercadosComp = compareItems<Supermercado>(localData.supermercados || [], serverData.supermercados || []);

  const serverNewer = productosComp.newer || categoriasComp.newer || supermercadosComp.newer;
  const hasConflicts = productosComp.conflicts > 0 || categoriasComp.conflicts > 0 || supermercadosComp.conflicts > 0;

  return {
    hasChanges: hasConflicts,
    serverNewer,
    differences: {
      productos: { local: localData.productos.length, server: productosComp.count, conflicts: productosComp.conflicts },
      categorias: { local: localData.categorias.length, server: categoriasComp.count, conflicts: categoriasComp.conflicts },
      supermercados: { local: localData.supermercados.length, server: supermercadosComp.count, conflicts: supermercadosComp.conflicts }
    }
  };
};