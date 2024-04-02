<template>
  <div id="appContainer" class="container mt-4" @click="setFullScreen">
    <my-tab 
      :alturaDisponible ="alturaDisponible" 
      :defaultActive    ="defaultTabActive" 
      :heightDesviation ="heightDesviation"
      :heightResponsive ="true" 
      :tabs             ="tabsData" 
      @tabHeightChanged ="handleTabHeightChanged"
      @tabChanged="tabActive" 
      >
      <template v-slot:tabContent0> <!-- Configuration -->
        <my-card 
          :height="alturaDisponible" 
          borderStyle="rounded-bottom"
          >
          <h1 class="text-center"><span class="appName">Hungry!</span><my-image-loader :image="'hungry.svg'" :className="'logo'" />
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
                @configurationFileError="handleImportConfigurationFileError" 
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
        </my-card>
      </template>
      <template v-slot:tabContent1> <!-- Add new product -->
        <my-card 
          borderStyle="rounded-bottom"
          :height="alturaDisponible" 
          >
            <slot-add-new-product ref="slotAddNewProductRef"
              :categoriesData="categoriesData" 
              :supermercados="supermarketsData" 
              :maxLenght="maxLenght" 
              @categoryChanged="handleCategoryChanged" 
              @addClick="haddleAddNewProductClick"
              />
        </my-card>
      </template>    
      <template v-slot:tabContent2> <!-- orderBy name -->
        <my-card 
          borderStyle="rounded-bottom" 
          v-touch:drag.once="handleDragCard"
          :height="alturaDisponible" 
          >
          <my-product-list 
            orderBy="name"
            :productList="productosVisibles" 
            @click="handleClickProduct"
            @longClick="handeLongClickProduct"
          />
        </my-card>
      </template>
      <template v-slot:tabContent3> <!-- orderBy categoryId,name -->
        <my-card 
          borderStyle="rounded-bottom" 
          v-touch:drag.once="handleDragCard"
          :height="alturaDisponible" 
          >
          <my-product-list 
            orderBy="categoryId"
            :productList="productosVisibles" 
            @click="handleClickProduct"
            @longClick="handeLongClickProduct"
          />
        </my-card>
      </template>
      <template v-slot:tabContent4> <!-- Shopping List -->
        <slotShoppingList :active="tabActiva==4" v-model="productsData" :alturaDisponible="alturaDisponible" :supermercados="supermarketsData" />
      </template>
    </my-tab>
  </div>
  <div id="anchorEditarProducto" class="d-none">
    <div id="divEditarProducto">
      <my-categories-list 
        :categories="categoriesData" 
        :selectCategory="productoSeleccionado?.id_categoria || 0" 
        v-model="categoryAtEdit"
        :selected="itemCategorySelected"
        class="swal"
        />
      <my-select 
        placeholder="Selecciona un supermercado" 
        ref="selectRef" 
        :options="supermarketsData" 
        :selected="supermercadoProducto || supermarketsData[0]"
        v-model="supermarketAtEdit"
        />
      <my-input ref="productoAEditarRef"
        v-model="productoAEditar" 
        :maxLength="maxLenght" 
        :placeholder="productoAEditar"
      />
    </div>
  </div> 
  <notifications group="pwa" position="top center" width="50%"  />
  <notifications group="app" position="bottom center" width="50%"  />
</template>

<script setup>
  import { localStorageService }      from '@/localStorageService'
  import { findIndexById }            from '@/utilidades'
  import MyButton                     from '@/components/MyButton.vue'
  import MyCard                       from '@/components/MyCard.vue'
  import MyCategoriesList             from '@/components/MyCategoriesList.vue'
  import MyImageLoader                from '@/components/MyImageLoader.vue'
  import MyInput                      from '@/components/MyInput.vue'
  import MyProductList                from '@/components/MyProductList.vue'
  import MySelect                     from '@/components/MySelect.vue'
  import MyTab                        from '@/components/MyTab.vue'

  import SlotConfigurationCategories  from '@/components/SlotConfigurationCategories.vue'
  import SlotConfigurationExport      from '@/components/SlotConfigurationExport.vue'
  import SlotConfigurationFullScreen  from '@/components/SlotConfigurationFullScreen.vue'
  import SlotConfigurationImport      from '@/components/SlotConfigurationImport.vue'
  import SlotConfigurationTabsActive  from '@/components/SlotConfigurationTabsActive.vue'
  import SlotAddNewProduct            from '@/components/SlotAddNewProduct.vue'
  import slotShoppingList             from '@/components/SlotShoppingList.vue'

  import Swal                         from 'sweetalert2'
  import { computed, ref, watch,onMounted }     from 'vue'
  import { useStore }                 from 'vuex'
  //import axios                        from 'axios'
  import { notify,Notifications } from '@kyvg/vue3-notification'
  import packageJson              from '../package.json'
  
  

      const store                   = useStore()
      const storeGet                = store.getters

      const getDataFromLocalStorage = index=> {
          let storedData = localStorageService.getSubItem(index);
          if (storedData) if (index != 'configuracion' ) store.dispatch(`set${index.replace(/\b\w/g,c=>c.toUpperCase())}`, storedData);
          return storedData ?? localStorageService.setSubItem(index, initialData[index]);
      }
      const slotAddNewProductRef    = ref(null)
      const productoAEditar         = ref('')
      const productoSeleccionado    = ref({})
      const itemCategorySelected    = ref(0)
      const supermercadoProducto    = ref(null)
      const categoryAtEdit          = ref(0)
      const supermarketAtEdit       = ref(null)
      const ignoreLongClickTimeout  = ref(0)
      const maxLenght               = storeGet.getMaxLenght()
      const saveProductsState       = storeGet.getSaveProductsState()
      const controlY                = ref(-1)
      const alturaDisponible        = ref(storeGet.getAlturaDisponible())
      const categoriasVisibles      = ref([])
      const initialData             = storeGet.getConfiguration()
      const CONFIG_NAMES            = storeGet.getConfigNames()
      const tabsData                = storeGet.getTabs()
      const supermarketsData        = storeGet.getSupermercados()
      const productoAEditarRef      = ref(null)
      const productsData            = ref(getDataFromLocalStorage('productos'       ))
      const categoriesData          = ref(getDataFromLocalStorage('categorias'      ))
      const defaultTabActive        = ref(getDataFromLocalStorage('defaultTabActive'))
      const fullScreen              = ref(getDataFromLocalStorage('fullScreen'      ))
      const configFullScreen        = ref(fullScreen.value)
      const selectRef               = ref(null)
      const tabActiva               = ref(defaultTabActive)

      const changes2Save={
        categoriasVisibiles:false,
        defaultTabActive: defaultTabActive.value
      }

      if (typeof categoriesData.value[0]==='undefined') categoriesData.value=initialData.categorias;

      const heightDesviation        = computed(()=>useStore().getters.getHeightDesviation())
      const categoriasVisiblesIds   = computed(()=>[...categoriesData.value.map(item=>({...item})).filter(item=>item.visible).map(item=>item.id)])
      const filtrarProductos        = productos=>productos.filter(producto => categoriasVisiblesIds.value.includes(producto.id_categoria))
      const productosVisibles       = computed(()=>filtrarProductos(productsData.value))
      watch(productsData,newValue=>productosVisibles.value=filtrarProductos(newValue))
      const supermarketActive       = ref({})
      const handleTabHeightChanged  = data=>alturaDisponible.value=data
      const tabActive               = tab=>tabActiva.value=tab
      const handleEliminarProducto  = ()=>{
        Swal.fire({
          title: '¿Estás seguro de que quieres eliminar el producto?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No',
          customClass: {
            confirmButton: 'btn btn-danger mb-2 mr-1', 
            cancelButton: 'btn btn-success mb-2', 
          },
          buttonsStyling: false, 
          target: document.querySelector("#appContainer"),
        }).then((result) => {
          if (result.isConfirmed){
            productsData.value = productsData.value.filter(item => item.id !== productoSeleccionado.value.id)
            productoSeleccionado.value=null;
            notify({group:"app", text:'Producto eliminado correctamente',type:"success", duration:3000})
          }
        });
      }
      const handleClickProduct      = product =>{
        if (storeGet.getIgnoreDrag()) return
        let index=findIndexById(product.id,productsData.value)
        if (index!=-1)
        {
          productsData.value[index].selected=(Object.prototype.hasOwnProperty.call(productsData.value[index], 'selected'))?!productsData.value[index].selected:true
          productsData.value[index].done=false
          if (saveProductsState) productsData.value = [...productsData.value]
        }
        else throw new Error('Error id de producto no encontrado en la lista de productos')
      }
      const handeLongClickProduct   = product =>{
        if (storeGet.getIgnoreDrag()) return
        productoSeleccionado.value=product;
        Swal.fire({
          title: product.text,
          text: '¿Qué desea hacer?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Editar Producto',
          cancelButtonText: 'Cancelar',
          customClass: {
            confirmButton: 'btn btn-success mr-1 mb-2', 
            denyButton: 'btn btn-danger mb-2 mr-1',
            cancelButton: 'btn btn-primary mb-2',
          },
          buttonsStyling: false, 
          showDenyButton: true, 
          denyButtonText: 'Eliminar Producto', 
          target: document.querySelector("#appContainer"),
        }).then((result) => {
          if (result.isConfirmed) handleEditarProducto()
          else if (result.isDenied) handleEliminarProducto()
        });
      }
      const handleCategoryChanged   = (id_categoria,text) =>{
        categoriesData.value[id_categoria].text=text
        categoriesData.value=[...categoriesData.value]
      }
      const setFullScreen           = () => {
        if (!fullScreen.value) return document.fullscreenElement?document.exitFullscreen():null
        if (document.fullscreenElement) return
        const    elemento=document.getElementById("appContainer");
        if      (elemento.requestFullscreen       ) elemento.requestFullscreen()
        else if (elemento.mozRequestFullScreen    ) elemento.mozRequestFullScreen()
        else if (elemento.webkitRequestFullscreen ) elemento.webkitRequestFullscreen()
        else if (elemento.msRequestFullscreen     ) elemento.msRequestFullscreen()
      }
      const handleChangeFullScreen  = checked => { configFullScreen.value=checked }
      const handleChangeTabActive   = data => { changes2Save.value.defaultTabActive=data }
      const haddleAddNewProductClick= (nuevoProducto,id_categoria,id_supermercado)=>{
        if (!productsData.value.some(producto => producto.text.toLowerCase() === nuevoProducto.toLowerCase())){
          productsData.value.push({
            id: productsData.value[productsData.value.length - 1].id+1,
            text:nuevoProducto,
            amount: 1,
            id_categoria:id_categoria,
            id_supermercado:id_supermercado
          });
          notify({group:"app", text:`Producto «${nuevoProducto}» añadido correctamente en ${categoriesData.value[id_categoria].text} para poder comprarlo en ${supermarketsData[id_supermercado].text}`,type:"success", duration:3000})
          productsData.value=[...productsData.value]
          slotAddNewProductRef.value.clearInput()
        }
        else
          Swal.fire({
            icon:'warning',
            title: 'Atención',
            html: `Ya existe un producto llamado<br>«${nuevoProducto}»`,
            target: document.querySelector("#appContainer"),
        })
      }
      const handleEditarProducto    = () =>{
        let aux=document.getElementById("divEditarProducto");
        let producto=productoSeleccionado.value;
        productoAEditar.value=producto.text
        categoryAtEdit.value=categoriesData.value[producto.id_categoria]
        supermarketAtEdit.value=supermarketsData[producto.id_supermercado]
        Swal.fire({
          title:              `Editar Producto<br>«${producto.text}»`,
          html:               '<div id="VueSweetAlert2"></div>',
          showCancelButton:   true,
          confirmButtonText:  'Confirmar',
          cancelButtonText:   'Cancelar',
          target:             document.querySelector("#appContainer"),
          willOpen: ()=>{
            itemCategorySelected.value=producto.id_categoria;
            supermercadoProducto.value=supermarketsData[producto.id_supermercado]
            document.getElementById('VueSweetAlert2').appendChild(aux);
          },
          willClose:()=>{document.getElementById('anchorEditarProducto').appendChild(aux)}
        }).then((result) => {
          if (result.isConfirmed){
            const areTheSame=(a,b)=>(Object.keys(a).length!==Object.keys(b).length)?false:Object.keys(a).every(key => key in b && a[key] === b[key])
            let newData={
              id:producto.id,
              text:productoAEditar.value,
              id_categoria:itemCategorySelected.value,
              id_supermercado:selectRef.value.selectedOption.id,
              amount: 1,              
              selected: false,
              done: false,
            }
            if (!areTheSame(producto,newData)){
              productsData.value[findIndexById(newData.id, productsData.value)] = newData;
              productsData.value=[...productsData.value]
              Swal.fire({
                title:'Atención',
                icon: 'success',
                text: 'Producto modificado correctamente',
                target: document.querySelector("#appContainer"),
              })
            }
            else {
              Swal.fire({
                title:'Atención',
                icon: 'info',
                text: 'No has realizado cambios al producto',
                target: document.querySelector("#appContainer"),
              })
            }
          }
        });
      }
      const handleCategoriesChecked = data =>{
      let aux=categoriesData.value.map(categoria => ({ ...categoria }))
          aux.forEach((item,index)=>item.visible=data.includes(index))
          categoriasVisibles.value=aux
          changes2Save.categoriasVisibiles=true
      }      
      //TODO hacer el login
      //funcion para hacer llamada mediante axios
      /*async function doLogin() {
        let email="";
        let pass="";
        let urlbase = 'https://www.infoinnova.es/lolo/api';
        let data = { email,  pass };

        const response = await axios.post(urlbase + '/login', data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        });
        console.log('Success:', response.data);
        return response.data;
      }*/


      watch(alturaDisponible,(newData)=>{ 
        if(Math.abs(newData-screen.availHeight)==Math.abs(heightDesviation.value)){
          store.dispatch('setAlturaDisponible',localStorageService.setSubItem('alturaDisponible', newData)) 
        }
      })
      watch(productsData,newData => store.dispatch('setProductos',localStorageService.setSubItem('productos', newData)))
      const handleImportConfigurationFileError=(error)=>{
        Swal.fire({
          icon:'error',
          title:(error=="ERROR_APPNAME")?"Atención":"ERROR INESPERADO",
          html:(error!="ERROR_APPNAME")?error:"El archivo de configuración seleccionado<br>no es un archivo de configuración<br>de «Hungry!» válido o está dañado",
          confirmButtonText:'Aceptar',
          target: document.querySelector("#appContainer"),
        })
      }
      const handleDragCard=(event)=>{
        if (typeof event.touches==='undefined') return
        if (event.touches.length==0) return
        if (controlY.value<0) controlY.value=event.touches[0].clientY
        if (controlY.value-event.touches[0].clientY>10){
          if (!storeGet.getIgnoreDrag())
          {
            store.dispatch('setIgnoreDrag',true)
          }
        }
        clearTimeout(ignoreLongClickTimeout.value)
        ignoreLongClickTimeout.value=setTimeout(releaseIgnoreLongClick ,1000)
      }
      const releaseIgnoreLongClick=()=>{
        controlY.value=-1
        store.dispatch('setIgnoreDrag',false)
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
            
            categoriesData.value=storeGet.getCategorias()
            productsData.value=storeGet.getProductos()
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
              categoriesData.value=data.categorias;
              importado.push("las categorias")
            }
            if (Object.prototype.hasOwnProperty.call(data, 'productos') && data.productos.length>0){
              productsData.value=data.productos;
              importado.push("los productos")
            }
            importado=importado.join(" y ")
            Swal.fire({
              icon:'success',
              title:'Atención',
              html:`Se han importado ${importado}<br>desde el archivo de configuración<br>importado correctamente`,
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
          categoriesData.value=[...categoriasVisibles.value.map(item => ({ ...item }))]
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
          localStorageService.setSubItem('defaultTabActive', changes2Save.defaultTabActive)
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
        fullScreen.value=configFullScreen.value
        changes2Save.categoriasVisibiles=false;
        return notify({group:"app", text:`Cambis guardados correctamente`,type:"success", duration:3000})
      }
      watch(categoriesData,   newData => store.dispatch('setCategorias',       localStorageService.setSubItem('categorias',       newData)))
      watch(productsData  ,   newData => store.dispatch('setProductos',        localStorageService.setSubItem('productos',        newData)));
      watch(fullScreen,       newData => store.dispatch('setFullScreen',       localStorageService.setSubItem('fullScreen',       newData)));
      watch(defaultTabActive, newData => store.dispatch('setDefaultTabActive', localStorageService.setSubItem('defaultTabActive', newData)));

      onMounted(()=>{
        supermarketActive.value = supermarketsData[0]; 
        document.addEventListener('contextmenu', event => event.preventDefault())
      })
</script>

<style>
  @import '@/assets/css/app.vue.css';
</style>