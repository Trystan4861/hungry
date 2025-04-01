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
            <div class="author">by {{ packageJson.author }}</div>
          </div>
        </div>
        <div class="revision">{{ store.loginData.value.fingerID + ' - ' }}v{{ packageJson.version }}</div>
      </div>
    </div>
    <div class="configWithScroll">
      <div class="row ">
        <div class="col-lg-4 col-md-6 text-center text-uppercase">
          <h6>Visibilidad de Categorías</h6>
          <div class="my-container px-2 mx-lg-3 mx-md-2" :class="{withScroll: store.categorias.value.length > 4}">
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
          <div class="my-container px-2 mx-lg-3 mx-md-1" :class="{withScroll: store.supermercados.value.length > 4}">
            <draggable
              v-model="supermercadosOrdenados"
              item-key="id"
              class="list-group"
              group="supermarkets"
              ghost-class="ghost"
              :animation="150"
              handle=".drag-handle"
              @start="onDragStart"
              @end="onDragEnd"
              :move="checkMove"
            >
              <template #item="{element, index}">
                <div class="d-flex align-items-center justify-content-between w-100">
                  <MyCheckbox
                    :enabled="element.id !== 0"
                    :key="element.id"
                    :value="element.id"
                    :label="element.text"
                    :checked-values="supermarketsVisibles"
                    group="configSupermarketsVisibility"
                    :required="true"
                    :styled="true"
                    @checked-values="handleSupermarketsCheckedValues"
                  />
                  <div class="drag-handle ms-2 cursor-move" v-if="element.id !== 0">
                    <span class="grip-icon"></span>
                  </div>
                  <div class="ms-2 invisible" v-else style="width: 20px;"></div>
                </div>
              </template>
            </draggable>
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
                  <MyCheckbox
                    :value="fullScreen?1:0"
                    :checked="fullScreen"
                    :styled="true"
                    :label="fullScreen ? 'Ejecutar a pantalla completa' : 'No ejecutar a pantalla completa'"
                    @checked-value="handleFullscreenChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-4 col-md-6 px-4 mt-4">
          <MyButton
            text="Importar Configuración"
            class="btn btn-primary fw-bold"
            @click="handleImport"
          />
        </div>
        <div class="col-lg-4 col-md-6 px-4 mt-4">
          <MyButton
            text="Exportar Configuración"
            class="btn btn-success fw-bold"
            @click="handleExport"
          />
        </div>
        <div class="col-lg-4 col-md-6 px-4 mt-4">
          <MyButton
            text="Guardar Cambios"
            class="btn btn-danger fw-bold"
            @click="handleSave"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-lg-4 col-md-6 px-4 mt-4">
          <MyButton
            :text="store.loginData.value.logged ? 'Cerrar Sesión' : 'Registrarse / Iniciar Sesión'"
            class="btn btn-info fw-bold"
            @click="handleLogin"
          />
        </div>
        <div class="col-lg-4 col-md-6 px-4 mt-4">
          <MyButton
            text="Restablecer Aplicación"
            class="btn btn-warning fw-bold"
            @click="handleReset"
          />
        </div>
        <div class="col-lg-4 col-md-6 px-4 mt-4" v-if="store.loginData.value.logged">
          <MyButton
            :text="isSyncing ? 'Sincronizando...' : 'Sincronizar Datos'"
            :disabled="isSyncing"
            class="btn btn-secondary fw-bold w-100"
            @click="handleSync"
          />
          <div class="text-center mt-1 small">
            <span v-if="lastSyncTime">
              Última sincronización: {{ formatFechaConLeadingZero(lastSyncTime) }}
            </span>
            <span v-else>
              No se ha sincronizado aún
            </span>
          </div>
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
  import draggable from 'vuedraggable'
  import type { Tab } from '~/types';
  import { myStore } from '~/composables/useStore';
  import { ref, watch } from 'vue';
  import { _DOM, DID } from '~/utils/dom'
  // Importar package.json para obtener la versión automáticamente
  // @ts-ignore - Ignoramos el error de TypeScript para la importación de JSON
  import * as packageJson from '../package.json'

  // Importar estilos específicos para este componente
  import '~/css/config.vue.css'

  // Importar composables y utilidades
  import { useAuth } from '~/composables/useAuth';
  import { useFingerprint } from '~/composables/useFingerprint';
  import { useDraggable } from '~/composables/useDraggable';
  import { useFormChanges } from '~/composables/useFormChanges';
  import { handleImport as importFile, handleExport as exportFile } from '~/utils/fileHandlers';
  import { showConfirm, showErrorSwal as showError, showSuccess } from '~/utils/sweetalert';
  import { useSync } from '~/composables/useSync';
  import { formatFechaConLeadingZero } from '~/utils/dateUtils';
  import { handleLastCheckedDeletionAttempt, handleSync as syncHandler } from '~/utils/configHandlers';

  interface Change2Save {
    categoriasVisibles: boolean;
    supermarketsVisible: boolean;
    defaultTabActive: boolean;
    fullScreen: boolean;
  }
  const store = myStore();
  const defaultTabActive = ref<number>(store.defaultTabActive.value);
  //creamos un array numerico únicamente con los ids de las categorias visibles
  const categoriasVisibles = ref<number[]>(store.categorias.value.filter(categoria => categoria.visible).map(categoria => categoria.id));

  //creamos un array numerico únicamente con los ids de los supermercados visibles
  const supermarketsVisibles = ref<number[]>(store.supermercados.value.filter(supermercado => supermercado.visible).map(supermercado => supermercado.id));
  const fullScreen = ref<boolean>(store.fullScreen.value);
  const tabselected = ref<Tab>(store.tabs[defaultTabActive.value]);
  // Usar el composable useFormChanges para gestionar los cambios
  const { changes: changes2Save, markAsChanged, hasChanges, resetChanges, saveChanges } = useFormChanges({
    categoriasVisibles: false,
    supermarketsVisible: false,
    defaultTabActive: false,
    fullScreen: false
  });

  // Usar el composable useDraggable para supermercados
  const {
    orderedItems: supermercadosOrdenados,
    onDragStart,
    onDragEnd,
    checkMove
  } = useDraggable(store.supermercados.value, {
    fixedFirstItem: true,
    onOrderChange: (newItems) => {
      store.supermercados.value = newItems;
      markAsChanged('supermarketsVisible');
    }
  });

  // Usar composable de fingerprint
  const { fingerID } = useFingerprint();



  // Inicializar el composable de sincronización
  const {
    syncWithServer,
    isSyncing,
    lastSyncTime,
    syncStatus
  } = useSync();

  const handleCategoriasCheckedValues = (values: number[]): void => {
    categoriasVisibles.value = values;
    markAsChanged('categoriasVisibles');
  }

  const handleSupermarketsCheckedValues = (values: number[]): void => {
    supermarketsVisibles.value = values;
    markAsChanged('supermarketsVisible');
  }

  const handleDefaultTabActiveChange = (value: number): void => {
    defaultTabActive.value = value;
    markAsChanged('defaultTabActive');
  }

  const handleFullscreenChange = (value: boolean): void => {
    fullScreen.value = value;
    markAsChanged('fullScreen');
  }

  const handleImport = async (): Promise<void> => {
    // Usar la utilidad de importación
    importFile({
      fileNameCheck: 'hungry',
      appNameCheck: 'Hungry!',
      updateUI: () => {
        // Actualizar las variables reactivas
        categoriasVisibles.value = store.categorias.value.filter(categoria => categoria.visible).map(categoria => categoria.id);
        supermarketsVisibles.value = store.supermercados.value.filter(supermercado => supermercado.visible).map(supermercado => supermercado.id);
        defaultTabActive.value = store.defaultTabActive.value;
        fullScreen.value = store.fullScreen.value;
      }
    });
  }

  const handleExport = (): void => {
    // Usar la utilidad de exportación
    exportFile({
      fileName: 'hungry_config'
    });
  }

  const handleSave = (): void => {
    // Definir las funciones de guardado para cada campo
    const saveCallbacks = {
      categoriasVisibles: () => store.updateCategorias(categoriasVisibles.value),
      supermarketsVisible: () => store.updateSupermercados(supermarketsVisibles.value),
      defaultTabActive: () => store.setDefaultTabActive(defaultTabActive.value),
      fullScreen: () => store.setFullScreen(fullScreen.value)
    };

    // Usar el método saveChanges del composable useFormChanges
    saveChanges(saveCallbacks);
  }

  // Usar composable de autenticación
  const { showRegisterMessage, dll, handleForgetPass, handleRegister, handleLogin } = useAuth();

  // Usar la función de utilidad para manejar el intento de eliminación de la última categoría

  /**
   * handleSync
   * Función para sincronizar manualmente los datos con el servidor
   */
  const handleSync = async (): Promise<void> => {
    // Importar el composable useUserData
    const { useUserData } = await import('~/composables/useUserData');
    const { fetchUserData, compareData } = useUserData();

    // Usar la función de utilidad para manejar la sincronización
    await syncHandler(store, fetchUserData, compareData, syncWithServer);
  };

  const handleReset = (): void => {
    showConfirm(
      'Atención',
      `
        Se restablecerá la aplicación a los valores de fábrica.
        <br /><br />
        Esto eliminará cualquier cambio que hayas hecho en las categorias así como todos los productos que hayas añadido.
        <br /><br />
        <b>¡Esta acción no se puede deshacer!</b>
      `,
      'Restablecer',
      'Cancelar',
      () => {
        // Borrar localStorage
        localStorage.clear();

        // Reiniciar el store a los valores por defecto
        store.resetToDefaults();

        // Mostrar mensaje de éxito
        showSuccess(
          'Aplicación restablecida',
          'La aplicación ha sido restablecida a los valores de fábrica'
        );
      }
    );
  };
</script>