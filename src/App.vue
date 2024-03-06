<template>
  <div id="appContainer" class="container mt-4" @click="setFullScreen">
    <my-tab :tabs="tabsData" :defaultActive="defaultTabActive" @tabHeightChanged="handleTabHeightChanged" :alturaDisponible="alturaDisponible" :heightResponsive="true" :heightDesviation="heightDesviation">
      <template v-slot:tabContent0> <!-- Configuration -->
        <my-card :height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <h1 class="text-center"><span class="appName">Hungry!</span><my-image-loader :image="'hungry.svg'" :className="'logo'" />
            <div class="text-center author">by Trystan4861</div>
          </h1>
          <div class="row">
            <div class="col-lg-4 col-12 col-md-6">
              <slot-configuration-categories :categorias="categoriesData" @categoriesChecked="handleCategoriesChecked" />
            </div>
            <div class="col-lg-8 col-12 col-md-6">
              <div class="row">
                <div class="col-lg-6 col-12 mt-lg-0 mt-4">
                  <slot-configuration-tabs-active :tabs="tabsData" :selected="defaultTabActive" @change="handleChangeTabActive" />
                </div>
                <div class="col-lg-6 col-12 mt-lg-0 mt-4">
                  <slot-configuration-full-screen @change="handleChangeFullScreen" :selected="configFullScreen" />
                </div>
              </div>
            </div>
          </div>
          <div class="row align-items-end">
            <div class="order-3 order-md-1 order-lg-1 col-lg-4 col-md-4 col-12 mt-4">
              <slot-configuration-import @configurationFileReaded="handleImportConfigurationFile" @configurationFileError="handleImportConfigurationFileError" />
            </div>
            <div class="order-2 col-lg-4 col-md-4 col-12 mt-4">
              <slot-configuration-export :configNames="CONFIG_NAMES" />
            </div>
            <div class="order-1 order-md-3 order-lg-3 col-lg-4 col-md-4 col-12 mt-4">
              <my-button :btnClass="'danger'" :text="'Guardar Cambios'" @click="saveConfigChanges" />
            </div>
          </div>
        </my-card>
      </template>
      <template v-slot:tabContent1> <!-- Add new product -->
        <my-card :height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <my-categories-list class="mb-4" :categories="categoriesData" @categorySelected="handleCategorySelected" @categoryLongClick="handleCategoryLongClick" />
          <my-select :selected="supermercados[0]" :options="supermercados" selectName="supermercadoAdd" @select="handleSelectSupermercado" :placeholder="'Selecciona un supermercado'" />
          <my-input :maxLength="maxLenght" class="mb-4" v-model="nuevoProducto" :placeholder="'Añade nuevos productos aquí'" :autofocus="true" @keyPressed:enter="handleAddClick" />
          <my-button text="Añadir" @click="handleAddClick" />
        </my-card>
      </template>    
      <template v-slot:tabContent2> <!-- orderBy name -->
        <my-card :height="alturaDisponible" :borderStyle="'rounded-bottom'" v-touch:drag.once="handleDragCard">
          <my-product-list 
            :productList="productosVisibles" 
            orderBy="name"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </my-card>
      </template>
      <template v-slot:tabContent3> <!-- orderBy categoryId,name -->
        <my-card :height="alturaDisponible" :borderStyle="'rounded-bottom'" v-touch:drag.once="handleDragCard">
          <my-product-list 
            :productList="productosVisibles" 
            orderBy="categoryId"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </my-card>
      </template>
      <template v-slot:tabContent4> <!-- Shopping List -->
        <div class="row mr-0">
          <div class="col-9 pr-0">
            <my-select @click="handleClickSupermercadoSL" :options="supermercados.filter(item=>item.id!=0)" :selected="supermercados[1]" selectName="supermercadoEdit" @select="handleSelectSupermercadoSL" />
          </div>
          <div class="col-3 p-0 overflow-hidden">
              <my-button class="clearList" :text="'Limpiar Lista'" :btnClass="'danger'" @click="clearList" />
          </div>
        </div>
        <my-card :height="alturaDisponible" :heightModifier="-50" :borderStyle="'rounded-bottom'">
          <div v-show="
          productosVisibles.some(item=>
            item.selected 
            && (item.id_supermercado==(supermercadoSL.value?.id) || item.id_supermercado==0) 
            && !item.done
          )">
            <div class="w-100 text-center mt-2">Se puede comprar en {{ supermercadoSL.value?.text }}<hr /></div>
            <my-product-list :productList="productosVisibles" orderBy="categoryId" :supermercado="supermercadoSL.value?.id || 0" :selected="true" :canBeDone="true" :hideDone="true" @click:product="handleShoplistClick" />
          </div>
          <div v-show="
          (
            productosVisibles.some(item=>
              item.selected 
              && !item.done 
              && (item.id_supermercado!=(supermercadoSL.value?.id||0) && (item.id_supermercado!=0))
            )
          ) || 0">
            <div class="w-100 text-center">Para comprar en otros Supermercados<hr /></div>
            <my-product-list :productList="productosVisibles" orderBy="categoryId" :selected="true" :supermercado="supermercadoSL.value?.id || 0" :hideSupermercado="true" :canBeDone="true" :hideDone="true" @click:product="handleShoplistClick" />
          </div>
          <div v-show="productosVisibles.some(item=>item.done)">
            <div class="w-100 text-center">Ya comprado<hr /></div>
            <my-product-list :productList="productosVisibles" orderBy="categoryId" :selected="true" :canBeDone="true" :showOnlyDone="true" @click:product="handleShoplistClick" />
          </div>
        </my-card>
      </template>
    </my-tab>
  </div>
  <div id="anchorEditarProducto" class="d-none">
    <div id="divEditarProducto">
      <my-categories-list ref="categoriesSliderRef" :categories="categoriesData" :selectCategory="productoSeleccionado?.id_categoria || 0" @categorySelected="handleCategorySelected" />
      <my-select ref="selectRef" :options="supermercados" selectName="supermercadoEdit" @select="handleSelectSupermercado" :placeholder="'Selecciona un supermercado'" />
      <my-input :maxLength="maxLenght" v-model="productoAEditar" :placeholder="productoAEditar"/>
    </div>
  </div> 
</template>

<script>
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

import Swal                         from 'sweetalert2'

import { computed, ref, watch }     from 'vue'
import { useStore }                 from 'vuex'

const LOCAL_STORAGE_KEYS = ['categoriesData','productsData','alturaDisponibleData','fullScreenData','defaultTabActiveData']
const INDEX_CATEGORIAS=0
const INDEX_PRODUCTOS=1
const INDEX_ALTURA_DISPONIBLE=2
const INDEX_FULL_SCREEN=3
const INDEX_DEFAULT_TAB_ACTIVE=4

const focusInput=(input)=>
{
  input.focus()
  input.setSelectionRange(input.value.length,input.value.length)
}

export default {
  name:'App',
  components:{
    MyButton,
    MyCard,
    MyCategoriesList,
    MyImageLoader,
    MyInput,
    MyProductList,
    MySelect,
    MyTab,
    SlotConfigurationCategories,
    SlotConfigurationExport,
    SlotConfigurationImport,
    SlotConfigurationTabsActive,
    SlotConfigurationFullScreen,
  },
  data(){
    return{
      inputText:'',
      nuevoProducto:'',
      productoAEditar:'',
      configs2Export:[],
      productoSeleccionado:{},
    }
  },
  methods:{
    setFullScreen(){
      if (!this.gotoFullScreen) return document.fullscreenElement?document.exitFullscreen():null
      if (document.fullscreenElement) return
      const elemento=document.getElementById("appContainer");
      if (elemento.requestFullscreen) {
        elemento.requestFullscreen();
      } else if (elemento.mozRequestFullScreen) { /* Firefox */
        elemento.mozRequestFullScreen();
      } else if (elemento.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elemento.webkitRequestFullscreen();
      } else if (elemento.msRequestFullscreen) { /* IE/Edge */
        elemento.msRequestFullscreen();
      }
    },
    handleChangeFullScreen(checked){
      this.configFullScreen=checked
    },
    handleClickSupermercadoSL(){
      if (!this.allowClick) clearTimeout(this.allowClickTimeout)
      this.allowClick=false;
      this.allowClickTimeout=this.doAllowClick();
    },
    handleChangeTabActive(data)
    {
      this.changes2Save.defaultTabActive=data
    },
    handleEditarProducto(){
      let aux=document.getElementById("divEditarProducto");
      this.productoAEditar=this.productoSeleccionado.text
      Swal.fire({
        title: `Editar Producto<br>«${this.productoSeleccionado.text}»`,
        html: '<div id="VueSweetAlert2"></div>',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        target: document.querySelector("#appContainer"),
        willOpen:()=>{
          this.$refs.categoriesSliderRef.seleccionarCategoria(this.productoSeleccionado.id_categoria);
            this.$refs.selectRef.selectOption(this.supermercados[findIndexById(this.productoSeleccionado.id_supermercado,this.supermercados)])
          document.getElementById('VueSweetAlert2').appendChild(aux);
        },
        didOpen:()=>{
          setTimeout(this.$refs.categoriesSliderRef.centrarCategoriaActiva,10);
        },
        willClose:()=>{
          document.getElementById('anchorEditarProducto').appendChild(aux);
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const areTheSame = (categoryA, categoryB) => {
            if (categoryA === null || categoryB === null || typeof categoryA !== 'object' || typeof categoryB !== 'object') return categoryA === categoryB;
            const keys1 = Object.keys(categoryA);
            const keys2 = Object.keys(categoryB);
            if (keys1.length !== keys2.length) return false;
            for (let key of keys1) {
              if (!(key in categoryB)) return false;
              if (typeof categoryA[key] !== 'object') {
                if (categoryA[key] !== categoryB[key]) return false;
              }
              else  if (!areTheSame(categoryA[key], categoryB[key])) return false;
            }
            return true;
          };
          let newData={
            id:this.productoSeleccionado.id,
            text:this.productoAEditar,
            categoria:this.categoriaActiva.value,
            id_categoria:this.categoriaActiva.value.id,
            supermercado:this.supermercadoActivo.value,
            id_supermercado:this.supermercadoActivo.value.id
          }
          if (!areTheSame(this.productoSeleccionado,newData))
          {
              this.productsData[findIndexById(newData.id, this.productsData)] = newData;
              this.productsData=[...this.productsData]
              Swal.fire({
                title:'Atención',
                icon: 'success',
                text: 'Producto modificado correctamente',
                target: document.querySelector("#appContainer"),
              })
          }
          else{
              Swal.fire({
                title:'Atención',
                icon: 'info',
                text: 'No has realizado cambios al producto',
                target: document.querySelector("#appContainer"),
              })
          }

        }
      });
    },
    handleEliminarProducto(){
      Swal.fire({
        title: '¿Estás seguro de que quieres eliminar el producto?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        customClass: {
          confirmButton: 'btn btn-danger mb-2 mr-1', // Clase CSS para el botón de cancelación (No)
          cancelButton: 'btn btn-success mb-2', // Clase CSS para el botón de confirmación (Sí)
        },
        buttonsStyling: false, // Desactivar el estilo predefinido de los botones
        target: document.querySelector("#appContainer"),
      }).then((result) => {
        if (result.isConfirmed) {
          this.productsData = this.productsData.filter(item => item.id !== this.productoSeleccionado.id)
          this.productoSeleccionado=null;
          Swal.fire({
            title:'Atención',
            icon: 'success',
            text: 'Producto eliminado correctamente',
            target: document.querySelector("#appContainer"),
          })
        }
      });
    },
    doAllowClick(timeOut=1000){
      return setTimeout(() => {
        this.allowClick=true
      }, timeOut)
    },
    handleShoplistClick(product)
    {
      if(!this.allowClick) return
      this.allowClick=false
      this.allowClickTimeout=this.doAllowClick(250)
      let index=findIndexById(product.id,this.productsData)
      this.productsData[index].done=!this.productsData[index].done
      if (this.saveProductsState) this.productsData=[...this.productsData]
    },
    handleClickProduct(product){
      if (this.storeGet.getIgnoreDrag()) return
      let index=findIndexById(product.id,this.productsData)
      if (index!=-1)
      {
        this.productsData[index].selected=(Object.prototype.hasOwnProperty.call(this.productsData[index], 'selected'))?!this.productsData[index].selected:true
        this.productsData[index].done=false
        if (this.saveProductsState) this.productsData=[...this.productsData]
      }
      else throw new Error('Error id de producto no encontrado en la lista de productos')
    },
    handeLongClickProduct(product){
      if (this.storeGet.getIgnoreDrag()) return
      this.productoSeleccionado=product;
      Swal.fire({
        title: product.text,
        text: '¿Qué desea hacer?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Editar Producto',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-success mr-1 mb-2', // Clase CSS para el botón de confirmación (Sí)
          denyButton: 'btn btn-danger mb-2 mr-1',
          cancelButton: 'btn btn-primary mb-2',
        },
        buttonsStyling: false, // Desactivar el estilo predefinido de los botonesINDEX_CATEGORIAS
        showDenyButton: true, // Mostrar el tercer botón
        denyButtonText: 'Eliminar Producto', // Texto del tercer botón
        target: document.querySelector("#appContainer"),
      }).then((result) => {
        if (result.isConfirmed) this.handleEditarProducto()
        else if (result.isDenied) this.handleEliminarProducto()
      });
    },
    handleTabHeightChanged(data){this.alturaDisponible=data;},
    handeFileReadError(error){
        Swal.fire({
          icon:'error',
          title:'Error',
          html:error,
          confirmButtonText:'Aceptar',
          target: document.querySelector("#appContainer"),
        })
        return false;
    },
    handleCategorySelected(category) { this.categoriaActiva.value = category; },
    handleCategoryLongClick(categoria) {
      Swal.fire({
        title: `Cambiar Nombre de Categoría<br> «${categoria?.text}»`,
        html: ` <label for="inputModifyCategory">Introduzca un nuevo nombre para la categoría</label>
                <input type="text" class="swal2-input" id="inputModifyCategory" maxlenght="${this.maxLenght}" value="${categoria.text}">
        `,
        target: document.querySelector("#appContainer"),
        didOpen: ()=>{
          setTimeout(()=>{
            focusInput(document.querySelector("#inputModifyCategory"))
          },50)
        },
        preConfirm: ()=>{
          return new Promise((resolve)=>{
              resolve({value: document.querySelector("#inputModifyCategory").value})
          }).then((result)=>{
            this.categoriesData[categoria.id].text = result.value;
            this.categoriesData=[...this.categoriesData]
          })
        },
        showCancelButton: true,
        confirmButtonText: 'Guardar cambios',
        cancelButtonText: 'Cancelar',
      });
    },
    clearList(){
      Swal.fire({
        title: `Atención`,
        text: 'Esto limpiará la lista de la compra',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-danger mr-1', // Clase CSS para el botón de cancelación (No)
          cancelButton: 'btn btn-success', // Clase CSS para el botón de confirmación (Sí)
        },
        buttonsStyling: false, // Desactivar el estilo predefinido de los botones
        target: document.querySelector("#appContainer"),
      }).then((result) => {
        if (result.isConfirmed) {
          this.productsData.forEach(producto=>{
            producto.selected=false
            producto.done=false
          })
          this.productsData=[...this.productsData]
        }
      });      
    },
    handleAddClick(){
      if (this.nuevoProducto==='')
      {
        Swal.fire({
          icon:'error',
          title:'Error',
          text:'Debes introducir un nombre para el nuevo producto',
          confirmButtonText:'Aceptar',
          target: document.querySelector("#appContainer"),
        })
        return false;
      }
      if (!this.productsData.some(producto => producto.text.toLowerCase() === this.nuevoProducto.toLowerCase()))
      {
        this.productsData.push({
          id:this.productsData.length,
          text:this.nuevoProducto,
          amount: 1,
          id_categoria:this.categoriaActiva.value.id,
          id_supermercado:this.supermercadoActivo.value.id
        });
        this.nuevoProducto="";
        this.productsData=[...this.productsData]
        focusInput(document.querySelector("#tab1").querySelector("input"))
      }
      else
        Swal.fire({
          icon:'warning',
          title: 'Atención',
          html: `Ya existe un producto llamado<br>«${this.nuevoProducto}»`,
          target: document.querySelector("#appContainer"),
      })
    },
    handleSelectSupermercado(selected){ 
      this.supermercadoActivo.value=selected 
    },
    handleSelectSupermercadoSL(selected){this.supermercadoSL.value=selected},
  },
  computed:{
    productosVisibles: function() {
        return this.productsData.filter(producto => this.categoriasVisiblesIds.includes(producto.id_categoria));
    },
    configuracion: function(){
      return useStore().getters.getConfiguration();
    },
  },
  setup() {
      document.addEventListener('contextmenu', (event) => event.preventDefault(),{passive: true})
      const store=useStore();
      const storeGet=store.getters;
      const ignoreLongClickTimeout=ref(0)
      const maxLenght=storeGet.getMaxLenght()
      const saveProductsState=storeGet.getSaveProductsState()
      const controlY=ref(-1)
      const allowClick=ref(true)
      const allowClickTimeout=ref(0)
      const alturaDisponible=ref()
      const categoriasVisibles=ref([])

      alturaDisponible.value=storeGet.getAlturaDisponible()

      const initialData=[storeGet.getCategorias(),[],storeGet.getAlturaDisponible(),storeGet.getFullScreen()]
      const CONFIG_NAMES = storeGet.getConfigNames();
      const tabsData= storeGet.getTabs();
      const supermercados=storeGet.getSupermercados();

      const productsData=ref(getDataFromLocalStorage(INDEX_PRODUCTOS));
      const categoriesData = ref(getDataFromLocalStorage(INDEX_CATEGORIAS));
      const defaultTabActive=ref(getDataFromLocalStorage(INDEX_DEFAULT_TAB_ACTIVE))
      const gotoFullScreen=ref(getDataFromLocalStorage(INDEX_FULL_SCREEN))
      const configFullScreen=ref(false)
      configFullScreen.value=gotoFullScreen.value

      let categoriasVisiblesIds=ref([])
      let tempCategoriasVisiblesIds=[]

      const heightDesviation= computed(()=>useStore().getters.getHeightDesviation())

      const changes2Save={
        categoriasVisibiles:false,
        defaultTabActive: defaultTabActive.value
      }

      if (typeof categoriesData.value[0]==='undefined') categoriesData.value=initialData[0];

      categoriasVisiblesIds.value=[...categoriesData.value.map(item=>({...item})).filter(item=>item.visible).map(item=>item.id)]
      const categoriaActiva = ref({})
      const supermercadoActivo=ref({})
      const supermercadoSL=ref({})
      supermercadoSL.value=supermercados[0]
      function fixProductos(productos){
        productos.forEach(producto=> {
          if (Object.prototype.hasOwnProperty.call(producto, 'supermercado')) delete producto.supermercado

          if (!Object.prototype.hasOwnProperty.call(producto, 'id_supermercado')) producto.id_supermercado = producto.supermercado.id
          if (!Object.prototype.hasOwnProperty.call(producto, 'amount')) producto.amount = 1

          if (Object.prototype.hasOwnProperty.call(producto, 'categoria')) delete producto.categoria
          if (!Object.prototype.hasOwnProperty.call(producto, 'id_categoria')) producto.id_categoria = producto.categoria.id        
        })
        return productos;
      }
      function fixCategorias(categorias){
        categorias.forEach(categoria=>{
          if (!Object.prototype.hasOwnProperty.call(categoria, 'visible')) categoria.visible = true
          else categoria.visible=Boolean(categoria.visible)

        })
        return categorias
      }
      function handleCategoriesChecked(data)
      {
      let aux=categoriesData.value.map(categoria => ({ ...categoria }))
          aux.forEach((item,index)=>item.visible=data.includes(index))
          categoriasVisibles.value=aux
          tempCategoriasVisiblesIds=[...data]
          changes2Save.categoriasVisibiles=true
      }      
      function getDataFromLocalStorage(index = INDEX_CATEGORIAS) {
          let storedData = localStorageService.getItem(LOCAL_STORAGE_KEYS[index]);
          if (storedData)
          {
            if (index == INDEX_CATEGORIAS )
            {
              if (storedData.some(category => !Object.prototype.hasOwnProperty.call(category, 'id'))) storedData = storedData.map((category, index) => ({ ...category, id: index }));
              storedData=fixCategorias(storedData)
              store.dispatch('setCategorias', storedData);
            }
            else if (index== INDEX_PRODUCTOS)
            {
              storedData=fixProductos(storedData)
              store.dispatch('setProductos', storedData);
            }
            else if (index==INDEX_ALTURA_DISPONIBLE)
              store.dispatch('setAlturaDisponible', storedData);
            else if (index==INDEX_FULL_SCREEN)
              store.dispatch('setFullScreen', storedData);
            else if (index==INDEX_DEFAULT_TAB_ACTIVE)
              store.dispatch('setDefaultTabActive',+storedData)
          }
          return storedData ? storedData : localStorageService.setItem(LOCAL_STORAGE_KEYS[index], initialData[index]);
      }
      watch(alturaDisponible,(newData)=>{ 
        if(Math.abs(newData-screen.availHeight)==Math.abs(heightDesviation.value)){
          store.dispatch('setAlturaDisponible',localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_ALTURA_DISPONIBLE], newData)) 
        }
      })
      watch(productsData,(newData)=>{ store.dispatch('setProductos',localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS], newData)) })
      const handleImportConfigurationFileError=(error)=>
      {
        Swal.fire({
          icon:'error',
          title:(error=="ERROR_APPNAME")?"Atención":"ERROR INESPERADO",
          html:(error!="ERROR_APPNAME")?error:"El archivo de configuración seleccionado<br>no es un archivo de configuración<br>de «Hungry!» válido o está dañado",
          confirmButtonText:'Aceptar',
          target: document.querySelector("#appContainer"),
        })
      }
      const handleDragCard=(event)=>{
        if (controlY.value<0) controlY.value=event.touches[0].clientY
        if (controlY.value-event.touches[0].clientY>10)
        {
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

      watch(() => storeGet.getFullScreen(), (nuevoValor) => {
        gotoFullScreen.value = nuevoValor;
      });
      function handleImportConfigurationFile(data){
        let importado=[];
        if (Object.prototype.hasOwnProperty.call(data, 'categorias') && data.categorias.length>0) {
          data.categorias=fixCategorias(data.categorias)
          categoriesData.value=data.categorias;
          importado.push("las categorias")
        }
        if (Object.prototype.hasOwnProperty.call(data, 'productos') && data.productos.length>0) {
          data.productos=fixProductos(data.productos);
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
      function saveConfigChanges(){
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
            store.dispatch('setDefaultTabActive',localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_DEFAULT_TAB_ACTIVE],changes2Save.defaultTabActive))
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

          store.dispatch('setFullScreen',localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_FULL_SCREEN],configFullScreen.value))
          categoriasVisiblesIds.value=[...tempCategoriasVisiblesIds]


          changes2Save.categoriasVisibiles=false;
      }
      watch(categoriesData, (newData) => {
        store.dispatch('setCategorias', localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS], newData));
      });

      watch(productsData, (newData) => {
        store.dispatch('setProductos', localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS], newData));
      });

      //const selectedSupermercado = ref('');
      return {
        store,
        storeGet,
        CONFIG_NAMES,
        tabsData, 
        productsData,
        categoriesData,
        categoriaActiva,
        categoriasVisibles,
        categoriasVisiblesIds,
        supermercadoActivo,
        supermercadoSL,
        supermercados, 
        defaultTabActive,
        alturaDisponible,
        maxLenght,
        saveProductsState,
        handleImportConfigurationFile,
        handleImportConfigurationFileError,
        ignoreLongClickTimeout,
        handleDragCard,
        releaseIgnoreLongClick,
        heightDesviation,
        allowClick,
        allowClickTimeout,
        gotoFullScreen,
        configFullScreen,
        saveConfigChanges,
        handleCategoriesChecked,
        tempCategoriasVisiblesIds,
        changes2Save,
    }
  },
  mounted(){
    setTimeout(this.nuevoProductoFocus,500);
  },  
};
</script>

<style>
html,body
{
  --bs-body-bg:black;
  --bs-body-color:white;
  display: flex;
  flex-direction: column;
  height: 100vh; /* 100% de la altura de la ventana */
  margin: 0; /* Eliminar el margen predeterminado del body */
  padding: 0; /* Eliminar el padding predeterminado del body */
  overflow: hidden;
}
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #888; }
::-webkit-scrollbar-thumb:hover { background: #555; }

#app { height: 100%!important; }
.swal2-input {
    margin: 0;
    width: 100%;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 20px;
}
.container {
  height: 100%;
  flex-grow: 1; /* Esto hará que .container se expanda */
  display: flex;
  flex-direction: column;
}
.tabs-container{
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Esto hace que el contenido se expanda */
  overflow-y: auto; /* Para permitir el desplazamiento si el contenido excede la altura disponible */
}
::-webkit-scrollbar {height: 4px;width: 4px;}
::-webkit-scrollbar-track { background: #f0f0f0; }
::-webkit-scrollbar-thumb { background: #888; }
.logo { width:60px; }
.author {
    font-size: xx-small;
    width: fit-content;
    margin: auto;
    position: relative;
    top: calc(-10px + 0.15vw);
    left: -15px;
}
div:where(.swal2-container) .swal2-html-container {
    z-index: 10 !important;
    overflow: visible !important;
}
hr {
    margin: .5rem auto !important; 
    width: 60%;
    text-align: center;
}
.clearList button {
  border-radius: 0px !important;
  width: -webkit-fill-available;
}
.overflow-hidden { overflow: hidden; }
.pr-0 { padding-right: 0 !important; }
.ml-3 { margin-left: 1rem !important; }
.mr-3 { margin-right: 1rem !important; }
.mr-1 { margin-right: .25rem !important; }
.mr-0 { margin-right: 0rem !important; }
.touch {
    height: 150px;
    background: gray;
    margin-top: 10px;
    justify-content: center;
    display: flex;
    align-items: center;
    user-select: none;
}
</style>