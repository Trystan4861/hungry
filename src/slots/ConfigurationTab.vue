<template>
  <my-card 
    borderStyle="rounded-bottom"
  >
    <h1 class="text-center"><span class="appName">Hungry!</span><my-image :image="'hungry.svg'" class="logo appBrand" />
      <div class="justify-content-between author"><span class="mr-1">v{{packageJson.version}}</span> <span>by Trystan4861</span></div>
    </h1>
    <div class="row configWithScroll">
      <div class="col">
        <div class="row">
          <div class="col-lg-4 col-12 col-md-6">
            <slot-configuration-categories 
              :categorias="categoriesData" 
              @categoriesChecked="handleCategoriesChecked" 
              />
          </div>
          <div class="col-lg-8 col-12 col-md-6">
            <div class="row h-100">
              <div class="col-lg-6 col-12 mt-lg-0 mt-2">
                <slot-configuration-supermarkets 
                  :supermarkets="supermarketsData" 
                  @supermarketsChecked="handleSupermarketsChecked"
                />
              </div>
              <div class="col-lg-6 col-12 mt-0">
                <div class="row h-100">
                  <div class="col-12 mt-0">
                    <slot-configuration-tabs-active 
                      :selected="defaultTabActive" 
                      :tabs="tabsData" 
                      @change="handleChangeTabActive" 
                      />
                    </div>
                    <div class="col-12 mt-lg-2 mt-2 text-center text-uppercase">
                      <div class="mb-2">Hay <b>{{ productsAmount }}</b> producto{{ productsAmount!=1?'s':'' }} dado{{ productsAmount!=1?'s':'' }} de alta</div>
                      <slot-configuration-full-screen 
                        :selected="configFullScreen" 
                        @change="handleChangeFullScreen" 
                      />
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row align-items-end">
          <div class="order-3 order-md-1 order-lg-1 col-lg-4 col-md-4 col-6 mt-md-4 mt-lg-4 mt-1">
            <slot-configuration-import 
              @configurationFileReaded="handleConfigurationImportFileReaded" 
              />
          </div>
          <div class="order-2 col-lg-4 col-md-4 col-6 mt-md-4 mt-lg-4 mt-1">
            <slot-configuration-export ref="exportRef" />
          </div>
          <div class="order-1 order-md-3 order-lg-3 col-lg-4 col-md-4 col-12 mt-md-4 mt-lg-4 mt-1">
            <my-button 
              btnClass="danger bold" 
              text="Guardar Cambios" 
              @click="saveConfigChanges" 
              />
          </div>
        </div>
        <div class="row align-items-end">
          <div class="col-lg-4 col-md-4 col-12 mt-md-4 mt-lg-4 mt-1">
            <my-button 
              btnClass="info bold" 
              :text="`${token.length==0?'Iniciar':'Cerrar'} Sesión`" 
              @click="handleLogin" 
              />
          </div>
          <div class="col-lg-4 col-md-4 col-12 mt-md-4 mt-lg-4 mt-1">
            <my-button 
              btnClass="warning bold" 
              text="Restablecer Aplicación" 
              @click="resetConfig" 
              />
          </div>
        </div>
      </div>
    </div>
    <div class="revision">{{ packageJson.revision }}</div>
  </my-card>
</template>

<script setup>
  import MyButton                       from '@components/MyButton.vue'
  import MyCard                         from '@/components/MyCard.vue';
  import MyImage                        from '@/components/MyImage.vue';
  
  import packageJson                    from '@/../package.json'

  import SlotConfigurationCategories    from '@slots/ConfigurationCategories.vue';
  import SlotConfigurationSupermarkets  from '@slots/ConfigurationSupermarkets.vue';
  import SlotConfigurationExport        from '@slots/ConfigurationExport.vue';
  import SlotConfigurationImport        from '@slots/ConfigurationImport.vue';
  import SlotConfigurationFullScreen    from '@slots/ConfigurationFullScreen.vue';
  import SlotConfigurationTabsActive    from '@slots/ConfigurationTabsActive.vue';
  import { ref,computed }               from 'vue';
  import { useStore }                   from 'vuex';
  import { notify }                     from '@kyvg/vue3-notification';
  import { localStorageService }        from '@/localStorageService'
  import { dispatchWhere as dispatch }  from '@/utilidades';
  import Swal                           from 'sweetalert2'
  import axios                          from 'axios';
  import md5                            from 'crypto-js/md5'

  const store                   = useStore()
  const storeGet                = store.getters

  const token                   = computed(()=>storeGet.getToken())

  const tabsData                = storeGet.getTabs()

  const fullScreen              = computed(()=>storeGet.getFullScreen())
  const categoriesData          = computed(()=>storeGet.getCategorias())
  const supermarketsData        = computed(()=>storeGet.getSupermercados()??storeGet.getInitialState('supermercados'))
  const productsAmount          = computed(()=>storeGet.getProductos().length)
  
  const defaultTabActive        = computed(()=>storeGet.getDefaultTabActive())

  const exportRef               = ref(null)
  
  const changes2Save            ={
    categoriasVisibiles:false,
    supermarketsVisibles:false,
    defaultTabActive: defaultTabActive.value,
  }
  
  const configFullScreen        = ref(fullScreen.value)

  const handleChangeFullScreen  = checked => configFullScreen.value=checked
  const handleChangeTabActive   = data => changes2Save.defaultTabActive=data 

  const handleLogin=()=>{
    Swal.fire({
      title: 'Iniciar sesión',
      html: `
        <input id="email" class="swal2-input" placeholder="Correo electrónico" autocomplete="off">
        <div class="input-group">
          <input id="pass" type="password" class="swal2-input password-input" placeholder="Contraseña" autocomplete="off">
          <div class="input-group-append">
            <label for="pass" class="input-group-text toggle-password">&#x1f512;&#xfe0e;</label>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton:true,
      cancelButtonText:"Cancelar",
      confirmButtonText: "Aceptar",
      preConfirm: async () => {
        const email = Swal.getPopup().querySelector('#email').value.toLowerCase().trim();
        const pass = md5(Swal.getPopup().querySelector('#pass').value.trim()).toString();

        let urlbase = storeGet.getURLBase;
        let data = { email, pass };
        
        try {
          const response = await axios.post(urlbase + '/login', data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
          });
          if (response.data.result) {
            const loginData = {
              email, token: response.data.token
            };
            store.dispatch('setLoginData', localStorageService.setSubItem('loginData', loginData));
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
        }
      }
    });
  };

const categoriasVisibles= ref(categoriesData.value.map(categoria => ({ ...categoria })))
const supermarketsVisibles= ref(supermarketsData.value.map(supermercado => ({ ...supermercado })))

  const handleCategoriesChecked = data =>{
    let aux=categoriesData.value.map(categoria => ({ ...categoria }))
    aux.forEach((item,index)=>item.visible=data.includes(index))
    categoriasVisibles.value= aux
    changes2Save.categoriasVisibiles=true
  }      
  const handleSupermarketsChecked = data =>{
    let aux=supermarketsData.value.map(supermercado => ({ ...supermercado }))
    aux.forEach((item,index)=>item.visible=data.includes(index))
    supermarketsVisibles.value= aux
    changes2Save.supermarketsVisibles=true
  }      

  const resetConfig= ()=>{
    Swal.fire({
        icon: 'info',
        title: 'Atención',
        html: 'Se restablecerá la aplicación a los valores de fábrica.<br /><br />Esto eliminará cualquier cambio que hayas hecho en las categorias así como todos los productos que hayas añadido.<br /><br /><b>¡Esta acción no se puede deshacer!</b>',
        showConfirmButton: true,
        confirmButtonText: 'Restablecer',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        target: document.querySelector("#appContainer"),
        allowOutsideClick: false
      }).then(result=>{
        if (result.isConfirmed)
        {
          Swal.fire({
            icon: 'question',
            html: '¿Desea realizar una <b>copia de seguridad</b> de sus datos <b>antes de borrarlos</b>?',
            showConfirmButton: true,
            confirmButtonText: 'si',
            showCancelButton: true,
            cancelButtonText: 'no',
            target: document.querySelector("#appContainer"),
            allowOutsideClick: false
          }).then(result=>{
            result.isConfirmed && exportRef.value.exportConfig()
            store.commit('resetStore');
          });    
        }
      });    
  }
  const handleConfigurationImportFileReaded=data=>{
    Swal.fire({
      title: '¿Qué deseas importar?',
      text: '¿Deseas importar el archivo de configuración completo o sólo productos, categorías y supermercados?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Completo',
      cancelButtonText: 'Cancelar',
      showDenyButton: true,
      denyButtonText:"Sólo datos"
    }).then((result) => {
      if (result.isConfirmed){
        data.loginData={email:'',token:''}
        store.dispatch('setConfiguracion', localStorageService.setItem(data));
        
        defaultTabActive.value=storeGet.getDefaultTabActive()

        Swal.fire({
          icon:'success',
          title:'Atención',
          html:`Configuración importada correctamente<br /><br /><b>Todos los datos han sido sobreescritos con los contenidos en el archivo importado</b>`,
          confirmButtonText:'Aceptar',
          target: document.querySelector("#appContainer"),
        })
      }
      else if (result.isDenied){
        let importado=[];
        storeGet.getDatos().forEach(el=>
          Object.prototype.hasOwnProperty.call(data, el) && 
          data[el].length>0 && 
          JSON.stringify(data[el])!=JSON.stringify(storeGet.getState(el)) &&
          importado.push(dispatch(store,el,data[el]))
        )
        if (importado.length>0)
        {
          importado = importado.length > 1 ? `${importado.slice(0, -1).join(", ")} y ${importado.slice(-1)}` : importado[0];
          Swal.fire({
            icon:'success',
            title:'Atención',
            html:`Se han importado ${importado}<br>desde el archivo de configuración<br>correctamente`,
            confirmButtonText:'Aceptar',
            target: document.querySelector("#appContainer"),
          })
        }
        else
        {
          Swal.fire({
            icon:'info',
            title:'Atención',
            html:`Los datos actuales son los mismos contenidos en el archivo importado<br /><br /><b>Nada ha sido cambiado</b>`,
            confirmButtonText:'Aceptar',
            target: document.querySelector("#appContainer"),
          })
        }
      }
    });
  }
  const saveConfigChanges=()=>{
    let toSave=changes2Save.defaultTabActive!=defaultTabActive.value || changes2Save.categoriasVisibiles || changes2Save.supermarketsVisibles || fullScreen.value!=configFullScreen.value;
    if (!toSave) return notify({group:"app", text:`No se han realizado cambios`,type:"info", duration:3000})
    if (changes2Save.categoriasVisibiles)
    {
      dispatch(store,'categorias',categoriasVisibles.value)
      Swal.fire({
        icon:'success',
        title:'Atención',
        html:`Cambibos guardados correctamente<br><br>Recuerda que todos los productos pertenecientes a categorías ocultas también estarán ocultos`,
        confirmButtonText:'Aceptar',
        target: document.querySelector("#appContainer"),
      })
    }
    if (changes2Save.supermarketsVisibles)
    {
      dispatch(store,'supermercados',supermarketsVisibles.value)
    }
    if (changes2Save.defaultTabActive!=defaultTabActive.value)
    {
      dispatch(store,'defaultTabActive',changes2Save.defaultTabActive);
      Swal.fire({
        icon: 'info',
        title: 'Atención',
        html: `El cambio de la pestaña activa por defecto será efectivo tras recargar Hungry!`,
        showConfirmButton: true,
        confirmButtonText: 'Aceptar',
        showDenyButton: true,
        denyButtonText: 'Recargar',
        target: document.querySelector("#appContainer"),
        allowOutsideClick: false
      }).then(result=>result.isDenied?window.location.reload():null);
    }
    if(fullScreen.value!=configFullScreen.value)
    {
      dispatch(store,'fullScreen',configFullScreen.value);
    }

    changes2Save.categoriasVisibiles=false;
    changes2Save.supermarketsVisibles=false;
    return notify({group:"app", text:`Cambios guardados correctamente`,type:"success", duration:3000})
  }
</script>
<style scoped>
.configWithScroll{
  overflow-y: auto;
  max-height: 610px;
}
</style>