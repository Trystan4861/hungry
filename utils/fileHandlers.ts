import Swal from 'sweetalert2';
import { _DOM } from '~/utils/dom';
import { myStore } from '~/composables/useStore';
import { showSuccess, showErrorSwal as showError } from '~/utils/sweetalert';
import type { LoginData, ImportData } from '~/types';

// Destino por defecto para todos los diálogos de SweetAlert2
const DEFAULT_TARGET = "#swallDestination";

/**
 * handleImport
 * Función para importar datos desde un archivo JSON
 * @param options Opciones de configuración para la importación
 */
export const handleImport = async (options: {
  fileNameCheck?: string;
  appNameCheck?: string;
  onComplete?: (data: any) => void;
  updateUI?: () => void;
} = {}) => {
  const {
    fileNameCheck = 'hungry',
    appNameCheck = 'Hungry!',
    onComplete,
    updateUI
  } = options;

  const store = myStore();

  // Crear un input de tipo file oculto
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  // Manejar el evento de cambio cuando se selecciona un archivo
  fileInput.onchange = async (event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];

      // Verificar que el nombre del archivo contiene el texto especificado
      if (fileNameCheck && !file.name.toLowerCase().includes(fileNameCheck)) {
        showError(
          'Archivo no válido',
          `El archivo debe contener "${fileNameCheck}" en su nombre`
        );
        document.body.removeChild(fileInput);
        return;
      }

      try {
        // Leer el contenido del archivo
        const content = await file.text();
        const data = JSON.parse(content);

        // Verificar que el appName es el esperado o agregarlo si no existe
        if (appNameCheck) {
          if (!data.appName) {
            data.appName = appNameCheck;
          } else if (data.appName !== appNameCheck) {
            showError(
              'Archivo no válido',
              `El archivo debe tener un appName igual a "${appNameCheck}"`
            );
            document.body.removeChild(fileInput);
            return;
          }
        }

        // Preguntar al usuario qué desea importar
        const result = await Swal.fire({
          icon: 'question',
          title: '¿Qué deseas importar?',
          html: '¿Deseas importar el archivo de configuración completo o sólo productos, categorías y supermercados?',
          showCancelButton: true,
          confirmButtonText: 'Completo',
          cancelButtonText: 'Cancelar',
          denyButtonText: 'Solo datos',
          showDenyButton: true,
          target: _DOM(DEFAULT_TARGET) as HTMLElement
        });

        if (result.isConfirmed) {
          // Importar configuración completa
          // Crear una copia de los datos
          const importData: ImportData = { ...data };

          // Verificar si el usuario está logueado y si los datos son del mismo usuario
          if (store.loginData.value.logged &&
              data.loginData &&
              data.loginData.email === store.loginData.value.email) {
            // Mantener los datos de login actuales si es el mismo usuario
            importData.loginData = store.loginData.value;
          } else {
            // Si no está logueado o es otro usuario, limpiar datos sensibles
            importData.loginData = {
              email: '',
              token: '',
              fingerID: store.loginData.value.fingerID,
              logged: false
            };
          }

          const success = store.importData(importData);
          if (success) {
            // Llamar a la función de actualización de UI si se proporciona
            if (updateUI) {
              updateUI();
            }

            showSuccess(
              'Importación completada',
              'La configuración completa se ha importado correctamente',
              2000
            );

            // Llamar a la función de finalización si se proporciona
            if (onComplete) {
              onComplete(importData);
            }
          }
        } else if (result.isDenied) {
          // Importar solo datos (productos, categorías y supermercados)
          // Determinar los datos de login a usar
          let loginDataToUse: LoginData;

          // Verificar si el usuario está logueado y si los datos son del mismo usuario
          if (store.loginData.value.logged &&
              data.loginData &&
              data.loginData.email === store.loginData.value.email) {
            // Mantener los datos de login actuales si es el mismo usuario
            loginDataToUse = store.loginData.value;
          } else {
            // Si no está logueado o es otro usuario, limpiar datos sensibles
            loginDataToUse = {
              email: '',
              token: '',
              fingerID: store.loginData.value.fingerID,
              logged: false
            };
          }

          // Crear el objeto de importación con loginData incluido
          const importData: ImportData = {
            appName: appNameCheck,
            productos: data.productos || [],
            categorias: data.categorias || [],
            supermercados: data.supermercados || [],
            loginData: loginDataToUse
          };

          const success = store.importData(importData);
          if (success) {
            // Llamar a la función de actualización de UI si se proporciona
            if (updateUI) {
              updateUI();
            }

            showSuccess(
              'Importación completada',
              'Los datos se han importado correctamente',
              2000
            );

            // Llamar a la función de finalización si se proporciona
            if (onComplete) {
              onComplete(importData);
            }
          }
        }
      } catch (error) {
        console.error('Error al importar archivo:', error);
        showError(
          'Error de importación',
          'El archivo seleccionado no es válido o está corrupto'
        );
      }
    }

    document.body.removeChild(fileInput);
  };

  // Hacer clic en el input para abrir el diálogo de selección de archivo
  fileInput.click();
};

/**
 * handleExport
 * Función para exportar datos a un archivo JSON
 * @param options Opciones de configuración para la exportación
 */
export const handleExport = (options: {
  fileName?: string;
  data?: any;
} = {}) => {
  const store = myStore();
  const { fileName = 'hungry_config', data = store.exportData() } = options;

  // Crear un objeto Blob con los datos
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

  // Crear una URL para el Blob
  const url = URL.createObjectURL(blob);

  // Crear un elemento <a> para descargar el archivo
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.json`;

  // Añadir el elemento al DOM, hacer clic en él y luego eliminarlo
  document.body.appendChild(a);
  a.click();

  // Limpiar
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);

  showSuccess(
    'Exportación completada',
    'La configuración se ha exportado correctamente',
    2000
  );
};