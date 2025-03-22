<template>
  <div>
    <div id="header" class="text-center mb-3">
      <div class="header-container">
        <div class="logo-text-container">
          <div class="logo-container">
            <a href="javascript:document.location.reload();"><MyImage image="hungry.svg" /></a>
          </div>
          <div class="text-container">
            <div class="appName">Hungry!</div>
            <div class="author">by {{ packageInfo.author }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="configWithScroll">
      <div class="row ">
        <div class="col-lg-4 col-md-6 text-center text-uppercase">
          <h6>Visibilidad de Categorías</h6>
          <div class="my-container mx-lg-3 mx-md-2" :class="{withScroll: store.categorias.value.length > 4}">
            <MyCheckbox
              v-for="categoria in store.categorias.value"
              :key="categoria.id"
              :value="categoria.id"
              :label="categoria.text"
              :checked-values="categoriasVisibles"
              group="configCategoriesVisibility"
              :required="true"
              :styled="true"
              @checked-values="handleCategoriasCheckedValues"
              @last-checked-deletion-attempt="handleLastCheckedDeletionAttempt"
            />
          </div>
        </div>
        <div class="col-lg-4 col-md-6 text-center text-uppercase">
          <h6>Visibilidad de Supermercados</h6>
          <div class="my-container mx-lg-3 mx-md-1" :class="{withScroll: store.supermercados.value.length > 4}">
            <MyCheckbox
              v-for="supermercado in store.supermercados.value"
              :enabled="supermercado.id !== 0"
              :key="supermercado.id"
              :value="supermercado.id"
              :label="supermercado.text"
              :checked-values="supermarketsVisibles"
              group="configSupermarketsVisibility"
              :required="true"
              :styled="true"
              @checked-values="handleSupermarketsCheckedValues"
            />
          </div>
        </div>
        <div class="col-lg-4 col-md-6 text-center text-uppercase">
          <div class="row">
            <div class="col-12 me-3">
                <h6>Pestaña por defecto</h6>
                <MySelect
                class="me-lg-3 me-md-1 ms-md-3"
                :options="store.tabs.filter(tab => tab.selectable)"
                :selected="tabselected"
                @select="handleDefaultTabActiveChange"/>
            </div>
            <div class="col-12">
              <div class="row">
                <div class="col-12 mt-2">
                  <span>Hay <b>{{ store.productos.value.length }}</b> productos dados de alta</span>
                </div>
                <div class="col-12 mt-2">
                  <span>Ejecutar en pantalla completa</span>
                  <MyCheckbox
                    :value="fullScreen?1:0"
                    :checked="fullScreen"
                    :styled="true"
                    :label="fullScreen ? 'Sí' : 'No'"
                    @checked-value="handleFullscreenChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-4">
          <MyButton
            text="Importar Configuración"
            :btn-class="'btn btn-primary fw-bold'"
            class="mx-3 mt-4"
            @click="handleImport"
          />
        </div>
        <div class="col-4">
          <MyButton
            text="Exportar Configuración"
            :btn-class="'btn btn-success fw-bold'"
            class="mx-3 mt-4"
            @click="handleExport"
          />
        </div>
        <div class="col-4">
          <MyButton
            text="Guardar Cambios"
            :btn-class="'btn btn-danger fw-bold'"
            class="mx-3 mt-4"
            @click="handleSave"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-4">
          <MyButton
            :text="store.loginData.value.logged ? 'Cerrar Sesión' : 'Registrarse / Iniciar Sesión'"
            :btn-class="'btn btn-info fw-bold'"
            class="mx-3 mt-4"
            @click="handleLogin"
          />
        </div>
        <div class="col-4">
          <MyButton
            text="Restablecer Aplicación"
            :btn-class="'btn btn-warning fw-bold'"
            class="mx-3 mt-4"
            @click="handleReset"
          />
        </div>
      </div>
    </div>
  </div>
  <div id="anchorLoginLinks-configuration" class="d-none">
    <div class="justify-content-between d-flex mt-2" :id="dll">
      <span class="link cursor-pointer no-select" @click="handleForgetPass">¿Olvidaste tu contraseña?</span><span class="link cursor-pointer no-select" @click="handleRegister">{{ showRegisterMessage?"¿No tienes cuenta?":"Iniciar Sesión" }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Tab } from '~/types';
  import { myStore } from '~/composables/useStore';
  import { ref, onMounted } from 'vue';
  import Swal from 'sweetalert2'
  import { localStorageService } from '~/localStorageService'
  import md5 from 'md5'
  import axios from 'axios'
  import * as FingerprintJS from '@fingerprintjs/fingerprintjs'
  import { compactString } from '~/utils/fingerprint'
  import { _DOM, DOM, DID } from '~/utils/dom'

  // Define package info directly instead of importing package.json
  const packageInfo = {
    author: "trystan4861"
  }

  interface Change2Save {
    categoriasVisibiles: boolean;
    supermarketsVisible: boolean;
    defaultTabActive: boolean;
    fullScreen: boolean;
  }
  const store = myStore();
  const defaultTabActive=ref(store.defaultTabActive)
  //creamos un array numerico únicamente con los ids de las categorias visibles
  const categoriasVisibles= ref(store.categorias.value.filter(categoria => categoria.visible).map(categoria => categoria.id))

  //creamos un array numerico únicamente con los ids de los supermercados visibles
  const supermarketsVisibles= ref(store.supermercados.value.filter(supermercado => supermercado.visible).map(supermercado => supermercado.id))
  const fullScreen=ref(store.fullScreen.value)
  const tabselected= ref<Tab>(store.tabs[defaultTabActive.value])
  const changes2Save=ref<Change2Save>({
    categoriasVisibiles:false,
    supermarketsVisible:false,
    defaultTabActive: false,
    fullScreen: false
  })

  // Variables para autenticación
  const showRegisterMessage = ref(true)
  const fingerID = ref(store.loginData.value.fingerID || '')
  const dll = ref('loginLinks')

  // Función para obtener el fingerID
  const getFingerprint = async () => {
    try {
      const fpPromise = FingerprintJS.load();
      const fp = await fpPromise;
      const result = await fp.get();
      const compactedId = compactString(result.visitorId);
      fingerID.value = compactedId;

      // Actualizar el fingerID en el store y localStorage
      store.loginData.value.fingerID = compactedId;
      localStorageService.setSubItem('loginData', store.loginData.value);

      return compactedId;
    } catch (error) {
      console.error('Error al obtener fingerprint:', error);
      return '';
    }
  }

  // Cargar el fingerprint al montar el componente
  onMounted(async () => {
    if (!fingerID.value) {
      await getFingerprint();
    }
  });

  // Función para obtener la URL base de la API
  const getURLBase = () => {
    return 'https://infoinnova.es/lolo/api'
  }

  const handleCategoriasCheckedValues = (values: number[]) => {
    categoriasVisibles.value=values
    changes2Save.value.categoriasVisibiles=true
  }

  const handleSupermarketsCheckedValues = (values: number[]) => {
    supermarketsVisibles.value=values
    changes2Save.value.supermarketsVisible=true
  }

  const handleDefaultTabActiveChange = (value: number) => {
    defaultTabActive.value = value
    changes2Save.value.defaultTabActive=true
  }

  const handleFullscreenChange = (value: boolean) => {
    fullScreen.value = value
    console.log("handleFullscreenChange: " + (value?"1":"0"))
    changes2Save.value.fullScreen=true
  }

  const handleImport = async () => {
    console.log("handleImport");

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

        // Verificar que el nombre del archivo contiene "hungry"
        if (!file.name.toLowerCase().includes('hungry')) {
          Swal.fire({
            icon: 'error',
            title: 'Archivo no válido',
            html: 'El archivo debe contener "hungry" en su nombre',
            confirmButtonText: 'Aceptar',
            target: _DOM("#swallDestination") as HTMLElement
          });
          document.body.removeChild(fileInput);
          return;
        }

        try {
          // Leer el contenido del archivo
          const content = await file.text();
          const data = JSON.parse(content);

          // Verificar que el appName es "Hungry!" o agregarlo si no existe
          if (!data.appName) {
            data.appName = "Hungry!";
          } else if (data.appName !== "Hungry!") {
            Swal.fire({
              icon: 'error',
              title: 'Archivo no válido',
              html: 'El archivo debe tener un appName igual a "Hungry!"',
              confirmButtonText: 'Aceptar',
              target: _DOM("#swallDestination") as HTMLElement
            });
            document.body.removeChild(fileInput);
            return;
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
            target: _DOM("#swallDestination") as HTMLElement
          });

          if (result.isConfirmed) {
            // Importar configuración completa
            // Limpiar datos sensibles de loginData
            const importData = { ...data };
            // Asegurarnos de que loginData tenga la estructura correcta
            importData.loginData = { email: '', token: '', fingerID: '', logged: false };

            const success = store.importData(importData);
            if (success) {
              // Actualizar las variables reactivas
              categoriasVisibles.value = store.categorias.value.filter(categoria => categoria.visible).map(categoria => categoria.id);
              supermarketsVisibles.value = store.supermercados.value.filter(supermercado => supermercado.visible).map(supermercado => supermercado.id);
              defaultTabActive.value = store.defaultTabActive.value;
              fullScreen.value = store.fullScreen.value;

              Swal.fire({
                icon: 'success',
                title: 'Importación completada',
                html: 'La configuración completa se ha importado correctamente',
                confirmButtonText: 'Aceptar',
                target: _DOM("#swallDestination") as HTMLElement,
                timer: 2000,
                timerProgressBar: true
              });
            }
          } else if (result.isDenied) {
            // Importar solo datos (productos, categorías y supermercados)
            const importData = {
              appName: "Hungry!",
              productos: data.productos || [],
              categorias: data.categorias || [],
              supermercados: data.supermercados || [],
              // Asegurarnos de que loginData tenga la estructura correcta
              loginData: { email: '', token: '', fingerID: '', logged: false }
            };

            const success = store.importData(importData);
            if (success) {
              // Actualizar las variables reactivas
              categoriasVisibles.value = store.categorias.value.filter(categoria => categoria.visible).map(categoria => categoria.id);
              supermarketsVisibles.value = store.supermercados.value.filter(supermercado => supermercado.visible).map(supermercado => supermercado.id);

              Swal.fire({
                icon: 'success',
                title: 'Importación completada',
                html: 'Los datos se han importado correctamente',
                confirmButtonText: 'Aceptar',
                target: _DOM("#swallDestination") as HTMLElement,
                timer: 2000,
                timerProgressBar: true
              });
            }
          }
          // Si es cancelado, no hacemos nada
        } catch (error) {
          console.error('Error al importar archivo:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            html: 'Error al importar el archivo. Verifica que sea un JSON válido.',
            confirmButtonText: 'Aceptar',
            target: _DOM("#swallDestination") as HTMLElement
          });
        }
      }

      // Eliminar el input del DOM
      document.body.removeChild(fileInput);
    };

    // Simular clic en el input para abrir el selector de archivos
    fileInput.click();
  }

  const handleExport = () => {
    console.log("handleExport");

    try {
      // Obtener los datos del store
      const data = store.exportData();

      // Limpiar datos sensibles de loginData
      data.loginData = { email: '', token: '', fingerID: '', logged: false };

      // Convertir a JSON
      const jsonString = JSON.stringify(data, null, 2);

      // Crear un blob y un enlace para descargar
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `hungry_config_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();

      // Limpiar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      Swal.fire({
        icon: 'success',
        title: 'Exportación completada',
        html: 'La configuración se ha exportado correctamente',
        confirmButtonText: 'Aceptar',
        target: _DOM("#swallDestination") as HTMLElement,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error al exportar configuración:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: 'Error al exportar la configuración',
        confirmButtonText: 'Aceptar',
        target: _DOM("#swallDestination") as HTMLElement
      });
    }
  }

  const handleSave = () => {
   console.log("handleSave")
   //comprobamos si algun valor de changes2Save es true usando funciones de array
   if (Object.values(changes2Save.value).some(value => value)) {
     console.log("Hay cambios que guardar")
     if (changes2Save.value.categoriasVisibiles) {
       console.log("Guardando categorias visibles")
       store.updateCategorias(categoriasVisibles.value)
     }
     if (changes2Save.value.supermarketsVisible) {
       console.log("Guardando supermercados visibles")
       store.updateSupermercados(supermarketsVisibles.value)
     }
     if (changes2Save.value.defaultTabActive) {
       console.log("Guardando pestaña activa por defecto")
       store.setDefaultTabActive(defaultTabActive.value)
     }
     if (changes2Save.value.fullScreen) {
       console.log("Guardando fullScreen")
       store.setFullScreen(fullScreen.value)
     }
     Swal.fire({
       icon: 'success',
       title: 'Cambios guardados',
       showConfirmButton: false,
       timer: 1500
     })
     //reseteamos los cambios
     changes2Save.value = {
       categoriasVisibiles: false,
       supermarketsVisible: false,
       defaultTabActive: false,
       fullScreen: false
     }
   }
  }

  // Funciones para autenticación
  const handleForgetPass = () => {
    console.log('handleForgetPass')
  }

  const handleRegister = () => {
    console.log('handleRegister')
    const titleElement = DID("swal2-title");
    const confirmButton = _DOM(".swal2-confirm");

    if (titleElement && confirmButton) {
      titleElement.innerText = showRegisterMessage.value ? "Realizar Registro" : "Iniciar Sesión";
      confirmButton.innerHTML = showRegisterMessage.value ? "Registrarse" : "Aceptar";
    }

    showRegisterMessage.value = !showRegisterMessage.value;
  }

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
        target: document.getElementById("swallDestination"),
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

          const email = emailInput.value.toLowerCase().trim();
          const pass = md5(passInput.value.trim()).toString();

          const anchorLinks = DID("anchorLoginLinks-configuration");
          const loginLinks = DID(dll.value);

          if (anchorLinks && loginLinks) {
            anchorLinks.appendChild(loginLinks);
          }

          let urlbase = getURLBase();
          let data = { email, pass, fingerID: fingerID.value };

          try {
            const response = await axios.post(urlbase + '/' + (showRegisterMessage.value ? 'login' : 'register') + '/', data, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
            if (response.data.result) {
              const loginData = {
                email,
                token: response.data.token,
                fingerID: fingerID.value,
                logged: true
              };

              // Actualizar loginData en el store
              store.loginData.value = loginData;
              // Guardar en localStorage
              localStorageService.setSubItem('loginData', loginData);

              Swal.fire({
                html: 'Has iniciado sesión correctamente',
                icon: 'success'
              });
            } else {
              Swal.fire({
                title: 'ERROR',
                html: response.data.error_msg,
                icon: 'error'
              });
            }
          } catch (error) {
            console.log('Error:', error);
            Swal.fire({
              title: 'ERROR',
              html: 'Ha ocurrido un error al conectar con el servidor',
              icon: 'error'
            });
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
        target: document.getElementById("swallDestination"),
        allowOutsideClick: false
      }).then(result => {
        if (result.isConfirmed) {
          // Actualizar loginData en el store
          store.loginData.value = { email: '', token: '', fingerID: '', logged: false };
          // Guardar en localStorage
          localStorageService.setSubItem('loginData', { email: '', token: '', fingerID: '', logged: false });

          Swal.fire({
            html: 'Has cerrado sesión correctamente',
            icon: 'success'
          });
        }
      });
    }
  }

  const handleLastCheckedDeletionAttempt = (value: number) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      html: "Al menos una categoría debe permanecer visible",
      confirmButtonText: 'Aceptar',
      target: _DOM("#swallDestination") as HTMLElement,
    });
  };

  const handleReset = () => {
    Swal.fire({
      title: 'Atención',
      html: `
        Se restablecerá la aplicación a los valores de fábrica.
        <br><br>
        Esto eliminará cualquier cambio que hayas hecho en las categorias así como todos los productos que hayas añadido.
        <br><br>
        <b>¡Esta acción no se puede deshacer!</b>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Restablecer',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      target: document.getElementById("swallDestination"),
      preConfirm: () => {
        // Borrar localStorage
        localStorage.clear();

        // Reiniciar el store a los valores por defecto
        store.resetToDefaults();

        // Mostrar mensaje de éxito
        Swal.fire({
          title: 'Aplicación restablecida',
          text: 'La aplicación ha sido restablecida a los valores de fábrica',
          icon: 'success',
          target: document.getElementById("swallDestination")
        });
      }
    });
  };
</script>
<style scoped>
.header-container {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 1rem;
  }

  .logo-text-container {
    display: flex;
    align-items: center;
    max-width: 500px;
    margin: 0 auto;
    gap: 0;
  }

  .logo-container {
    height: 100%;
    display: flex;
    align-items: center;
    padding-right: 0;
    margin-right: 0;
  }

  .logo-container :deep(img) {
    height: auto;
    width: auto;
    max-height: 70px;
    display: block;
  }

  .text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: -5px;
    text-align: left;
  }

  .appName {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .author {
    font-size: 0.6rem;
    margin-top: -5px;
    padding-left: 10px;
  }

  .configWithScroll{
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 610px;
  }

  .my-container{
    max-height: 9rem;
    overflow-y: auto;
    overflow-x: hidden;
    margin-bottom: .625rem;
    border: 3px solid #555;
    user-select: none;
    padding-top: 10px;
    min-width: 19.3rem;
  }

  .my-container .my-checkbox .Toggle{
    padding-left: 0px !important;
  }

  .my-container.withScroll{
    border-right-width: 0;
  }

  /* Estilos para el toggle de contraseña */
  .input-group {
    position: relative;
    display: flex;
    width: 100%;
  }

  .password-input {
    width: 100%;
  }

  .input-group-append {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .input-group-text {
    cursor: pointer;
    padding: 0 10px;
    height: 100%;
    display: flex;
    align-items: center;
    background-color: #e9ecef;
    border-left: 1px solid #ced4da;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
</style>