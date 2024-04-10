<template>
  <my-card 
    borderStyle="rounded-bottom"
  >
    <h1 class="text-center"><span class="appName">Hungry!</span><my-image :image="'hungry.svg'" class="logo appBrand" />
      <div class="justify-content-between author"><span class="mr-1">v{{packageJson.version}}</span> <span>by Trystan4861</span></div>
    </h1>
    <div class="row">
      <div class="col-lg-4 col-12 col-md-6">
        <slot-configuration-categories 
          :categorias="categoriesData" 
          @categoriesChecked="handleCategoriesChecked" 
          />
      </div>
      <div class="col-lg-8 col-12 col-md-6">
        <div class="row">
          <div class="col-lg-6 col-12 mt-0">
            <slot-configuration-tabs-active 
              :selected="defaultTabActive" 
              :tabs="tabsData" 
              @change="handleChangeTabActive" 
              />
          </div>
          <div class="col-lg-6 col-12 mt-lg-0 mt-2">
            <slot-configuration-full-screen 
              :selected="configFullScreen" 
              @change="handleChangeFullScreen" 
              />
          </div>
        </div>
      </div>
    </div>
    <div class="row align-items-end">
      <div class="order-3 order-md-1 order-lg-1 col-lg-4 col-md-4 col-12 mt-md-4 mt-lg-4 mt-1">
        <slot-configuration-import 
          @configurationFileReaded="handleImportConfigurationFile" 
          />
      </div>
      <div class="order-2 col-lg-4 col-md-4 col-12 mt-md-4 mt-lg-4 mt-1">
        <slot-configuration-export 
          :configNames="CONFIG_NAMES" 
          />
      </div>
      <div class="order-1 order-md-3 order-lg-3 col-lg-4 col-md-4 col-12 mt-md-4 mt-lg-4 mt-1">
        <my-button 
          btnClass="danger" 
          text="Guardar Cambios" 
          @click="saveConfigChanges" 
          />
      </div>
    </div>
    <div class="revision">rev. {{ packageJson.revision }}</div>
  </my-card>
</template>

<script setup>
  import MyButton                     from '@components/MyButton.vue'
  import MyCard                       from '@/components/MyCard.vue';
  import MyImage                      from '@/components/MyImage.vue';
  
  import packageJson                  from '@/../package.json'

  import SlotConfigurationCategories  from '@slots/ConfigurationCategories.vue';
  import SlotConfigurationExport      from '@slots/ConfigurationExport.vue';
  import SlotConfigurationImport      from '@slots/ConfigurationImport.vue';
  import SlotConfigurationFullScreen  from '@slots/ConfigurationFullScreen.vue';
  import SlotConfigurationTabsActive  from '@slots/ConfigurationTabsActive.vue';
  import { useStore }                 from "vuex";
  import { notify }                   from '@kyvg/vue3-notification';
  import { ref,computed }                      from 'vue';
  import { localStorageService }      from '@/localStorageService'
  import Swal                         from 'sweetalert2'

  const store=useStore()
  const storeGet=store.getters

  const tabsData                = storeGet.getTabs()
  const initialData             = storeGet.getConfiguration()
  const CONFIG_NAMES            = storeGet.getConfigNames()

  const getDataFromLocalStorage = index=> {
    let storedData = localStorageService.getSubItem(index);
    if (storedData) if (index != 'configuracion' ) store.dispatch(`set${index.replace(/\b\w/g,c=>c.toUpperCase())}`, storedData);
    return storedData ?? localStorageService.setSubItem(index, initialData[index]);
  }
  const defaultTabActive        = ref(getDataFromLocalStorage('defaultTabActive'))
  
  const changes2Save={
    categoriasVisibiles:false,
    defaultTabActive: defaultTabActive.value
  }
      
      
  const fullScreen              = ref(getDataFromLocalStorage('fullScreen'      ))
  const categoriesData          = computed(()=>storeGet.getCategorias())
  
  const configFullScreen        = ref(fullScreen.value)

  const handleChangeFullScreen  = checked => { configFullScreen.value=checked }
  const handleChangeTabActive   = data => changes2Save.defaultTabActive=data 

  const dispatch=(where,what)=>store.dispatch(`set${where.replace(/\b\w/g,c=>c.toUpperCase())}`,  localStorageService.setSubItem(where, what));

  const categoriasVisibles= ref(categoriesData.value.map(categoria => ({ ...categoria })))

  const handleCategoriesChecked = data =>{
    let aux=categoriesData.value.map(categoria => ({ ...categoria }))
    aux.forEach((item,index)=>item.visible=data.includes(index))
    categoriasVisibles.value= aux
    changes2Save.categoriasVisibiles=true
  }      
  const handleImportConfigurationFile=data=>{
    Swal.fire({
      title: '¿Qué deseas importar?',
      text: '¿Deseas importar el archivo de configuración completo o sólo los productos y las categorías?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Completo',
      cancelButtonText: 'Sólo productos y categorías'
    }).then((result) => {
      if (result.isConfirmed){
        store.dispatch('setConfiguration', localStorageService.setItem(data));
        
        defaultTabActive.value=storeGet.getDefaultTabActive()
        fullScreen.value=storeGet.getFullScreen()

        Swal.fire({
          icon:'success',
          title:'Atención',
          html:`Configuración importada correctamente`,
          confirmButtonText:'Aceptar',
          target: document.querySelector("#appContainer"),
        })
      }
      else if (result.dismiss === Swal.DismissReason.cancel){
        let importado=[];
        if (Object.prototype.hasOwnProperty.call(data, 'categorias') && data.categorias.length>0){
          dispatch('categorias',data.categorias)
          importado.push("las categorias")
        }
        if (Object.prototype.hasOwnProperty.call(data, 'productos') && data.productos.length>0){
          dispatch('productos',data.productos)
          importado.push("los productos")
        }
        importado=importado.join(" y ")
        Swal.fire({
          icon:'success',
          title:'Atención',
          html:`Se han importado ${importado}<br>desde el archivo de configuración<br>correctamente`,
          confirmButtonText:'Aceptar',
          target: document.querySelector("#appContainer"),
        })
      }
    });
  }
  const saveConfigChanges=()=>{
    let toSave=changes2Save.defaultTabActive!=defaultTabActive.value || changes2Save.categoriasVisibiles || fullScreen.value!=configFullScreen.value;
    if (!toSave) return notify({group:"app", text:`No se han realizado cambios`,type:"info", duration:3000})
    if (changes2Save.categoriasVisibiles)
    {
      dispatch('categorias',categoriasVisibles.value)
      Swal.fire({
        icon:'success',
        title:'Atención',
        html:`Cambibos guardados correctamente<br><br>Recuerda que todos los productos pertenecientes a categorías ocultas también estarán ocultos`,
        confirmButtonText:'Aceptar',
        target: document.querySelector("#appContainer"),
      })
    }
    if (changes2Save.defaultTabActive!=defaultTabActive.value)
    {
      dispatch('defaultTabActive',changes2Save.defaultTabActive);
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
      fullScreen.value=configFullScreen.value
      dispatch('fullScreen',configFullScreen.value);
    }

    changes2Save.categoriasVisibiles=false;
    return notify({group:"app", text:`Cambis guardados correctamente`,type:"success", duration:3000})
  }
</script>