import Swal from 'sweetalert2';
import { _DOM } from '~/utils/dom';

// Destino por defecto para todos los diálogos de SweetAlert2
const DEFAULT_TARGET = "#swallDestination";

/**
 * showErrorAlert
 * Muestra un mensaje de error utilizando SweetAlert2
 * @param title Título del mensaje de error
 * @param message Mensaje de error
 */
export const showErrorAlert = (title: string, message: string) => {
  Swal.fire({
    icon: 'error',
    title: title,
    html: message,
    confirmButtonText: 'Aceptar',
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
  });
};

// Renombramos la función para evitar conflictos con #app/composables/error
export const showErrorSwal = showErrorAlert;

/**
 * showSuccess
 * Muestra un mensaje de éxito utilizando SweetAlert2
 * @param title Título del mensaje de éxito
 * @param message Mensaje de éxito
 * @param timer Tiempo en milisegundos que se mostrará el mensaje (0 para no ocultar automáticamente)
 */
export const showSuccess = (title: string, message: string, timer: number = 2000) => {
  Swal.fire({
    icon: 'success',
    title: title,
    html: message,
    confirmButtonText: 'Aceptar',
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
    timer: timer > 0 ? timer : undefined,
    timerProgressBar: timer > 0
  });
};

/**
 * showConfirm
 * Muestra un diálogo de confirmación utilizando SweetAlert2
 * @param title Título del diálogo
 * @param message Mensaje del diálogo
 * @param confirmText Texto del botón de confirmación
 * @param cancelText Texto del botón de cancelación
 * @param confirmCallback Función a ejecutar si se confirma
 */
export const showConfirm = (
  title: string,
  message: string,
  confirmText: string = 'Aceptar',
  cancelText: string = 'Cancelar',
  confirmCallback: () => void
) => {
  Swal.fire({
    icon: 'question',
    title: title,
    html: message,
    showConfirmButton: true,
    confirmButtonText: confirmText,
    showCancelButton: true,
    cancelButtonText: cancelText,
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
    allowOutsideClick: false
  }).then(result => {
    if (result.isConfirmed) {
      confirmCallback();
    }
  });
};

/**
 * showLoading
 * Muestra un diálogo de carga utilizando SweetAlert2
 * @param title Título del diálogo
 * @param message Mensaje del diálogo
 * @returns Instancia de SweetAlert2 para poder cerrarla manualmente
 */
export const showLoading = (title: string, message: string) => {
  return Swal.fire({
    title: title,
    html: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    target: _DOM(DEFAULT_TARGET) as HTMLElement
  });
};

/**
 * showWarning
 * Muestra un mensaje de advertencia utilizando SweetAlert2
 * @param title Título del mensaje de advertencia
 * @param message Mensaje de advertencia
 */
export const showWarning = (title: string, message: string) => {
  Swal.fire({
    icon: 'warning',
    title: title,
    html: message,
    confirmButtonText: 'Aceptar',
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
  });
};