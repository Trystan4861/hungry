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
    title: title,
    input: 'text',
    inputValue: inputValue,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
    inputValidator: (value) => {
      if (!value) {
        return 'Debe introducir un valor';
      }
      return null;
    }
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
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    denyButtonText: denyButtonText,
    cancelButtonText: cancelButtonText,
    customClass: customClass,
    showDenyButton: showDenyButton,
    buttonsStyling: false,
    target: _DOM(DEFAULT_TARGET) as HTMLElement
  });
};

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
    title: title,
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
    cancelButtonText: cancelButtonText,
    confirmButtonText: confirmButtonText,
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
    didOpen: () => {
      // Añadir funcionalidad para mostrar/ocultar contraseña
      const togglePassword = _DOM('.toggle-password', Swal.getPopup());
      const passInput = _DOM('#pass', Swal.getPopup()) as HTMLInputElement;

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

/**
 * showLogoutConfirm
 * Muestra un diálogo de confirmación para cerrar sesión
 * @param confirmCallback Función a ejecutar si se confirma el cierre de sesión
 */
export const showLogoutConfirm = (confirmCallback: () => void) => {
  Swal.fire({
    icon: 'question',
    title: 'Atención',
    html: 'Se procederá a cerrar su sesión.<br>¿Desea continuar?',
    showConfirmButton: true,
    confirmButtonText: 'Cerrar Sesión',
    showCancelButton: true,
    cancelButtonText: 'Cancelar',
    target: _DOM(DEFAULT_TARGET) as HTMLElement,
    allowOutsideClick: false
  }).then(result => {
    if (result.isConfirmed) {
      confirmCallback();
    }
  });
};

/**
 * showValidationMessage
 * Muestra un mensaje de validación en un diálogo de SweetAlert2 abierto
 * @param message Mensaje de validación a mostrar
 */
export const showValidationMessage = (message: string) => {
  Swal.showValidationMessage(message);
};

/**
 * getSwalPopup
 * Obtiene el elemento popup de SweetAlert2 actualmente abierto
 * @returns Elemento HTML del popup
 */
export const getSwalPopup = () => {
  return Swal.getPopup();
};

/**
 * closeSwal
 * Cierra el diálogo de SweetAlert2 actualmente abierto
 */
export const closeSwal = () => {
  Swal.close();
};

/**
 * showSyncConfirm
 * Muestra un diálogo de confirmación para sincronización de datos
 * @param message Mensaje HTML a mostrar en el diálogo
 * @returns Promise que se resuelve con el resultado del diálogo
 */
export const showSyncConfirm = (message: string) => {
  return Swal.fire({
    title: 'Sincronización de datos',
    html: message,
    icon: 'question',
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: 'Enviar Locales',
    denyButtonText: 'Recibir Remotos',
    cancelButtonText: 'Cancelar',
    target: _DOM(DEFAULT_TARGET) as HTMLElement
  });
};

/**
 * showSyncSuccess
 * Muestra un mensaje de éxito para la sincronización de datos
 * @param title Título del mensaje
 * @param message Mensaje a mostrar
 */
export const showSyncSuccess = (title: string, message: string) => {
  Swal.fire({
    icon: 'success',
    title: title,
    html: message,
    confirmButtonText: 'Aceptar',
    target: _DOM(DEFAULT_TARGET) as HTMLElement
  });
};

/**
 * showImportOptions
 * Muestra un diálogo para seleccionar opciones de importación
 * @param html Contenido HTML del diálogo
 * @returns Promise que se resuelve con el resultado del diálogo
 */
export const showImportOptions = (html: string) => {
  return Swal.fire({
    icon: 'question',
    title: '¿Qué deseas importar?',
    html: html,
    showCancelButton: true,
    confirmButtonText: 'Completo',
    cancelButtonText: 'Cancelar',
    denyButtonText: 'Solo datos',
    showDenyButton: true,
    target: _DOM(DEFAULT_TARGET) as HTMLElement
  });
};