import { ref } from 'vue';
import md5 from 'md5';
import { _DOM, DID } from '~/utils/dom';
import { myStore } from '~/composables/useStore';
import getApiService from '~/services/apiService';
import { showSuccess, showErrorSwal as showError, showLoginForm, showLogoutConfirm, showValidationMessage, getSwalPopup } from '~/utils/sweetalert';
import type { LoginResponse } from '~/types/api/response';

/**
 * useAuth
 * Composable para gestionar la autenticación de usuarios
 * @returns Funciones y estados relacionados con la autenticación
 */
export function useAuth() {
  const store = myStore();
  const showRegisterMessage = ref(true);
  const dll = ref('loginLinks');

  const apiService = getApiService();

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
      showLoginForm(
        {
          title: 'Iniciar Sesión',
          confirmButtonText: "Aceptar",
          cancelButtonText: "Cancelar",
          isLogin: true
        },
        async () => {
          const emailInput = _DOM('#email', getSwalPopup()) as HTMLInputElement;
          const passInput = _DOM('#pass', getSwalPopup()) as HTMLInputElement;

          if (!emailInput || !passInput) {
            showValidationMessage('Error al obtener los campos del formulario');
            return false;
          }

const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

          if (!pattern.test(passInput.value)) {
            showValidationMessage(`La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número`);
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
            const response: LoginResponse = await (!showRegisterMessage.value
              ? apiService.register({ email, pass })
              : apiService.login({ email, pass, fingerid: store.loginData.value.fingerID }));

            if (response.result && response.token) {
              store.updateLoginData({
                email: email,
                token: response.token,
                fingerID: store.loginData.value.fingerID,
                logged: true
              });

              showSuccess(
                !showRegisterMessage.value ? 'Registro completado' : 'Sesión iniciada',
                !showRegisterMessage.value ? 'Te has registrado correctamente' : 'Has iniciado sesión correctamente'
              );
            } else {
              showError(
                'ERROR',
                response.error_msg || 'Error en la operación'
              );
            }
          } catch (error) {
            console.error('Error en login/registro:', error);
            showError(
              'ERROR',
              'Ha ocurrido un error al conectar con el servidor'
            );
          }
        },
        () => {
          showRegisterMessage.value = true;
          const loginFormLinks = DID('LoginFormLinksSweetAlert2');
          const loginLinks = DID(dll.value);

          if (loginFormLinks && loginLinks) {
            loginFormLinks.appendChild(loginLinks);
          }
        },
        () => {
          const anchorLinks = DID("anchorLoginLinks-configuration");
          const loginLinks = DID(dll.value);

          if (anchorLinks && loginLinks) {
            anchorLinks.appendChild(loginLinks);
          }
        }
      );
    } else {
      // Mostramos un diálogo de confirmación para cerrar la sesión
      showLogoutConfirm(() => {
        // Actualizar loginData en el store
        store.updateLoginData({ email: '', token: '', fingerID: store.loginData.value.fingerID, logged: false });
        showSuccess(
          'Sesión cerrada',
          'Has cerrado sesión correctamente'
        );
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