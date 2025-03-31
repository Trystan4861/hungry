import { ref } from 'vue';
import Swal from 'sweetalert2';
import md5 from 'md5';
import { _DOM, DID } from '~/utils/dom';
import { myStore } from '~/composables/useStore';
import { apiService } from '~/services/apiService';
import { useSync } from '~/composables/useSync';
import { showSuccess, showErrorSwal as showError } from '~/utils/sweetalert';

/**
 * useAuth
 * Composable para gestionar la autenticación de usuarios
 * @returns Funciones y estados relacionados con la autenticación
 */
export function useAuth() {
  const store = myStore();
  const showRegisterMessage = ref(true);
  const dll = ref('loginLinks');


  /**
   * handleForgetPass
   * Función para manejar el olvido de contraseña
   */
  const handleForgetPass = () => {
    console.log('handleForgetPass');
    // Implementar lógica para recuperar contraseña
  };

  /**
   * handleRegister
   * Función para alternar entre registro e inicio de sesión
   */
  const handleRegister = () => {
    const titleElement = DID("swal2-title");
    const confirmButton = _DOM(".swal2-confirm");

    if (titleElement && confirmButton) {
      titleElement.innerText = showRegisterMessage.value ? "Realizar Registro" : "Iniciar Sesión";
      confirmButton.innerHTML = showRegisterMessage.value ? "Registrarse" : "Aceptar";
    }

    showRegisterMessage.value = !showRegisterMessage.value;
  };

  /**
   * handleLogin
   * Función para manejar el inicio de sesión o registro
   */
  const handleLogin = () => {
    if (!store.loginData.value.logged) {
      Swal.fire({
        title: 'Iniciar Sesión',
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
        cancelButtonText: "Cancelar",
        confirmButtonText: "Aceptar",
        target: _DOM("#swallDestination") as HTMLElement,
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
        willOpen: () => {
          showRegisterMessage.value = true;
          const loginFormLinks = DID('LoginFormLinksSweetAlert2');
          const loginLinks = DID(dll.value);

          if (loginFormLinks && loginLinks) {
            loginFormLinks.appendChild(loginLinks);
          }
        },
        willClose: () => {
          const anchorLinks = DID("anchorLoginLinks-configuration");
          const loginLinks = DID(dll.value);

          if (anchorLinks && loginLinks) {
            anchorLinks.appendChild(loginLinks);
          }
        },
        preConfirm: async () => {
          const emailInput = _DOM('#email', Swal.getPopup()) as HTMLInputElement;
          const passInput = _DOM('#pass', Swal.getPopup()) as HTMLInputElement;

          if (!emailInput || !passInput) {
            Swal.showValidationMessage('Error al obtener los campos del formulario');
            return false;
          }
          
          const $pattern = "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/";

          if (!passInput.value.match($pattern)) {
            Swal.showValidationMessage(`La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número`);
            return false;
          }


          const email = emailInput.value.toLowerCase().trim();
          const pass = md5(passInput.value.trim()).toString();

          const anchorLinks = DID("anchorLoginLinks-configuration");
          const loginLinks = DID(dll.value);

          if (anchorLinks && loginLinks) {
            anchorLinks.appendChild(loginLinks);
          }

          try {
            // Usar el servicio de API para login o registro
            const response = await (showRegisterMessage.value
              ? apiService.login(email, pass, store.loginData.value.fingerID)
              : apiService.register(email, pass, store.loginData.value.fingerID));

            if (response.result) {
              store.loginData.value.token = response.token;
              store.loginData.value.logged = true;

              showSuccess(
                'Sesión iniciada',
                'Has iniciado sesión correctamente'
              );
            } else {
              showError(
                'ERROR',
                response.error_msg
              );
            }
          } catch (error) {
            console.error('Error en login/registro:', error);
            showError(
              'ERROR',
              'Ha ocurrido un error al conectar con el servidor'
            );
          }
        }
      });
    } else {
      // Mostramos un swal de confirmación para cerrar la sesión
      Swal.fire({
        icon: 'question',
        title: 'Atención',
        html: 'Se procederá a cerrar su sesión.<br>¿Desea continuar?',
        showConfirmButton: true,
        confirmButtonText: 'Cerrar Sesión',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        target: _DOM("#swallDestination") as HTMLElement,
        allowOutsideClick: false
      }).then(result => {
        if (result.isConfirmed) {
          // Actualizar loginData en el store
          store.loginData.value = { email: '', token: '', fingerID: store.loginData.value.fingerID, logged: false };

          showSuccess(
            'Sesión cerrada',
            'Has cerrado sesión correctamente'
          );
        }
      });
    }
  };

  return {
    showRegisterMessage,
    dll,
    handleForgetPass,
    handleRegister,
    handleLogin
  };
}