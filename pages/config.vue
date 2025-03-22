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
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Tab } from '~/types';
  import { myStore } from '~/composables/useStore';
  import { ref } from 'vue';
  import { _DOM } from '~/utilidades'
  import Swal from 'sweetalert2'

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
   const hasChanges = Object.values(changes2Save.value).some(value => value)
   if (hasChanges) {
    let mensaje:string="Se han guardado los cambios realizados a "
    //recorremos changes2Save y actualizamos el store si está a true
    for (const [key, value] of Object.entries(changes2Save.value)) {
      if (value) {
        //si key es categoriasVisibiles, supermarketsVisible, defaultTabActive o fullScreen
        if (key === 'categoriasVisibiles') {
          //Utilizamos la nueva función updateCategorias para actualizar todas las categorías de una vez
          mensaje += "Categorías, ";
          store.updateCategorias(categoriasVisibles.value);
          changes2Save.value.categoriasVisibiles = false;
        } else if (key === 'supermarketsVisible') {
          //Utilizamos la nueva función updateSupermercados para actualizar todos los supermercados de una vez
          mensaje += "Supermercados, ";
          store.updateSupermercados(supermarketsVisibles.value);
          changes2Save.value.supermarketsVisible = false;
        } else if (key === 'defaultTabActive') {
          //Actualizamos la pestaña por defecto
          mensaje += "Pestaña por defecto, ";
          store.defaultTabActive.value = defaultTabActive.value;
          changes2Save.value.defaultTabActive = false;
        } else if (key === 'fullScreen') {
          //Actualizamos el modo pantalla completa
          mensaje += "Modo pantalla completa, "
          store.setFullscreen(fullScreen.value);
          changes2Save.value.fullScreen = false;
        }
      }
    }
    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'Configuración guardada',
      html: mensaje.slice(0, -1) + " correctamente",
      confirmButtonText: 'Aceptar',
      target: _DOM("#swallDestination") as HTMLElement,
      timer: 2000,
      timerProgressBar: true
    });
   }
   else{
    Swal.fire({
      icon: 'error',
      title: 'Error',
      html: "No hay cambios para guardar",
      confirmButtonText: 'Aceptar',
      target: _DOM("#swallDestination") as HTMLElement,
      timer: 2000,
      timerProgressBar: true
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
</style>