import Swal from 'sweetalert2';
import { _DOM } from '~/utils/dom';

// Destino por defecto para todos los diálogos de SweetAlert2
const DEFAULT_TARGET = "#swallDestination";

// Tipo para las opciones comunes de SweetAlert2
type SwalBaseOptions = {
  title?: string;
  html?: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  timer?: number;
  timerProgressBar?: boolean;
  allowOutsideClick?: boolean;
  [key: string]: any;
};

/**
 * showAlert
 * Función genérica para mostrar alertas utilizando SweetAlert2
 * @param icon Icono a mostrar ('success', 'error', 'warning', 'info', 'question')
 * @param title Título del mensaje
 * @param message Mensaje a mostrar
 * @param timer Tiempo en milisegundos que se mostrará el mensaje (0 para no ocultar automáticamente)
 */
export const showAlert = (
  icon: 'success' | 'error' | 'warning' | 'info' | 'question',
  title: string,
  message: string,
  timer: number = 0
) => {
  Swal.fire({
    icon,
    title,
    html: message,
    confirmButtonText: 'Aceptar',
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
    timer: timer > 0 ? timer : undefined,
    timerProgressBar: timer > 0
  });
};

// Funciones de alerta básicas
export const showErrorAlert = (title: string, message: string) => showAlert('error', title, message);
export const showErrorSwal = showErrorAlert; // Alias para evitar conflictos
export const showSuccess = (title: string, message: string, timer: number = 2000) => showAlert('success', title, message, timer);
export const showWarning = (title: string, message: string) => showAlert('warning', title, message);

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
    title,
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
    title,
    html: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    target: _DOM(DEFAULT_TARGET) as HTMLElement
  });
};

/**
 * showInputPrompt
 * Muestra un diálogo con un campo de texto para que el usuario introduzca información
 * @param title Título del diálogo
 * @param inputValue Valor inicial del campo de texto
 * @param placeholder Texto de ayuda para el campo de texto
 * @param confirmText Texto del botón de confirmación
 * @param cancelText Texto del botón de cancelación
 * @returns Promise que se resuelve con el resultado del diálogo
 */
export const showInputPrompt = (
  title: string,
  inputValue: string = '',
  placeholder: string = '',
  confirmText: string = 'Aceptar',
  cancelText: string = 'Cancelar'
) => {
  return Swal.fire({
    title,
    input: 'text',
    inputValue,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
    inputValidator: (value) => !value ? 'Debe introducir un valor' : null
  });
};

/**
 * showConfirmWithOptions
 * Muestra un diálogo de confirmación con múltiples opciones utilizando SweetAlert2
 * @param title Título del diálogo
 * @param message Mensaje del diálogo
 * @param options Opciones de configuración para el diálogo
 * @returns Promise que se resuelve con el resultado del diálogo
 */
export const showConfirmWithOptions = (
  title: string,
  message: string,
  options: {
    showDenyButton?: boolean;
    confirmButtonText?: string;
    denyButtonText?: string;
    cancelButtonText?: string;
    customClass?: {
      confirmButton?: string;
      denyButton?: string;
      cancelButton?: string;
    };
  } = {}
) => {
  const {
    showDenyButton = false,
    confirmButtonText = 'Aceptar',
    denyButtonText = 'Opción alternativa',
    cancelButtonText = 'Cancelar',
    customClass = {
      confirmButton: 'btn btn-primary me-2',
      denyButton: 'btn btn-warning me-2',
      cancelButton: 'btn btn-secondary'
    }
  } = options;

  return Swal.fire({
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText,
    denyButtonText,
    cancelButtonText,
    customClass,
    showDenyButton,
    buttonsStyling: false,
    target: _DOM(DEFAULT_TARGET) as HTMLElement
  });
};

/**
 * showOptionsDialog
 * Función genérica para mostrar diálogos con múltiples opciones
 * @param title Título del diálogo
 * @param message Mensaje HTML a mostrar
 * @param options Opciones adicionales para el diálogo
 * @returns Promise que se resuelve con el resultado del diálogo
 */
export const showOptionsDialog = (
  title: string,
  message: string,
  options: {
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    confirmButtonText?: string;
    denyButtonText?: string;
    cancelButtonText?: string;
    showDenyButton?: boolean;
  } = {}
) => {
  const {
    icon = 'question',
    confirmButtonText = 'Aceptar',
    denyButtonText = 'Opción alternativa',
    cancelButtonText = 'Cancelar',
    showDenyButton = true
  } = options;

  return Swal.fire({
    title,
    html: message,
    icon,
    showCancelButton: true,
    showDenyButton,
    confirmButtonText,
    denyButtonText,
    cancelButtonText,
    target: _DOM(DEFAULT_TARGET) as HTMLElement
  });
};

// Funciones específicas que utilizan showOptionsDialog
export const showSyncConfirm = (message: string) =>
  showOptionsDialog('Sincronización de datos', message, {
    confirmButtonText: 'Enviar Locales',
    denyButtonText: 'Recibir Remotos'
  });

export const showImportOptions = (html: string) =>
  showOptionsDialog('¿Qué deseas importar?', html, {
    confirmButtonText: 'Completo',
    denyButtonText: 'Solo datos'
  });

export const showSyncSuccess = (title: string, message: string) =>
  showSuccess(title, message, 0);

export const showLogoutConfirm = (confirmCallback: () => void) =>
  showConfirm('Atención', 'Se procederá a cerrar su sesión.<br>¿Desea continuar?',
    'Cerrar Sesión', 'Cancelar', confirmCallback);

/**
 * showLoginForm
 * Muestra un formulario de inicio de sesión o registro utilizando SweetAlert2
 * @param options Opciones de configuración para el formulario
 * @param preConfirmCallback Función a ejecutar cuando se confirma el formulario
 * @param willOpenCallback Función a ejecutar cuando se abre el formulario
 * @param willCloseCallback Función a ejecutar cuando se cierra el formulario
 * @returns Promise que se resuelve con el resultado del diálogo
 */
export const showLoginForm = (
  options: {
    title: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    isLogin?: boolean;
  },
  preConfirmCallback: () => Promise<any>,
  willOpenCallback?: () => void,
  willCloseCallback?: () => void
) => {
  const {
    title,
    confirmButtonText = 'Aceptar',
    cancelButtonText = 'Cancelar',
    isLogin = true
  } = options;

  return Swal.fire({
    title,
    html: `
    <input id="email" class="swal2-input" placeholder="Correo electrónico" autocomplete="off">
    <div class="input-group">
      <input id="pass" type="password" class="swal2-input password-input" placeholder="Contraseña" autocomplete="off">
      <div class="input-group-append">
        <label for="pass" class="input-group-text toggle-password">&#x1f512;&#xfe0e;</label>
      </div>
    </div>
    <div id="LoginFormLinksSweetAlert2"></div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    cancelButtonText,
    confirmButtonText,
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
    didOpen: () => {
      // Añadir funcionalidad para mostrar/ocultar contraseña
      const togglePassword = _DOM('.toggle-password', getSwalPopup());
      const passInput = _DOM('#pass', getSwalPopup()) as HTMLInputElement;

      if (togglePassword && passInput) {
        togglePassword.addEventListener('click', () => {
          // Cambiar el tipo de input entre password y text
          const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
          passInput.setAttribute('type', type);

          // Cambiar el icono del candado
          togglePassword.innerHTML = type === 'password' ? '&#x1f512;&#xfe0e;' : '&#x1f513;&#xfe0e;';
        });
      }
    },
    willOpen: willOpenCallback,
    willClose: willCloseCallback,
    preConfirm: preConfirmCallback
  });
};

// Funciones utilitarias simples
export const showValidationMessage = (message: string) => Swal.showValidationMessage(message);
export const getSwalPopup = () => Swal.getPopup();
export const closeSwal = () => Swal.close();