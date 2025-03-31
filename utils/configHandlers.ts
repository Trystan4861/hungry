import { myStore } from '~/composables/useStore';
import { showErrorSwal as showError, showLoading, showSuccess } from '~/utils/sweetalert';
import Swal from 'sweetalert2';
import type { ImportData } from '~/types';

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
): Promise<void> => {
  // Verificar si el usuario está autenticado
  if (!store.loginData.value.logged) {
    showError(
      'Error',
      "Debes iniciar sesión para sincronizar datos"
    );
    return;
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
    Swal.close();

    // Comparar datos del servidor con datos locales
    const comparison = compareData(serverData);

    if (!comparison.hasChanges) {
      // Si no hay diferencias, mostrar mensaje
      showSuccess(
        'Sincronización completada',
        'Tus datos ya están sincronizados con el servidor'
      );
      return;
    }

    // Si hay diferencias, mostrar diálogo para que el usuario decida
    const { serverNewer, differences } = comparison;

    // Construir mensaje con las diferencias
    const diffMessage = `
      <p>Se han encontrado diferencias entre tus datos locales y los del servidor,
      <b>${serverNewer ? 'los datos del servidor' : 'tus datos locales'} son más recientes.</b></p>
      <p><h3>¿Qué deseas hacer?</h3></p>
    `;

    const result = await Swal.fire({
      title: 'Sincronización de datos',
      html: diffMessage,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Enviar Locales',
      denyButtonText: 'Recibir Remotos',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      // Enviar datos locales al servidor
      const syncResult = await syncWithServer();
      if (syncResult) {
        Swal.fire(
          'Sincronizado',
          'Tus datos se han enviado al servidor correctamente',
          'success'
        );
      } else {
        showError(
          'Error',
          'No se pudieron sincronizar los datos con el servidor'
        );
      }
    } else if (result.isDenied) {
      // Usar datos del servidor
      store.importData(serverData);
      Swal.fire(
        'Sincronizado',
        'Se han cargado los datos del servidor',
        'success'
      );
    }
  } catch (error) {
    console.error('Error en sincronización:', error);
    Swal.close();
    showError(
      'Error de sincronización',
      'Ocurrió un error al obtener los datos del servidor. Inténtalo de nuevo más tarde.'
    );
  }
};