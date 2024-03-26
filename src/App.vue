<template>
  <div id="appContainer" class="container mt-4" @click="setFullScreen">
    <my-tab 
      :alturaDisponible ="alturaDisponible" 
      :defaultActive    ="defaultTabActive" 
      :heightDesviation ="heightDesviation"
      :heightResponsive ="true" 
      :tabs             ="tabsData" 
      @tabHeightChanged ="handleTabHeightChanged" 
      >
      <template v-slot:tabContent0> <!-- Configuration -->
        <my-card 
          :height="alturaDisponible" 
          borderStyle="rounded-bottom"
          >
          <h1 class="text-center"><span class="appName">Hungry!</span><my-image-loader :image="'hungry.svg'" :className="'logo'" />
            <div class="text-center author">by Trystan4861</div>
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
          <div class="row align-items-end">
            <div class="order-1 order-md-3 order-lg-3 col-lg-4 col-md-4 col-12 mt-md-4 mt-lg-4 mt-1">
              <my-button 
                btnClass="info" 
                text="axios" 
                @click="getAPIData" 
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
          <my-categories-list class="mb-4" 
            :categories="categoriesData" 
            @categoryLongClick="handleCategoryLongClick" 
            @categorySelected="handleCategorySelected" 
            />
          <my-select 
            placeholder="Selecciona un supermercado" 
            :options="supermercados" 
            :selected="supermercados[0]" 
            @select="handleSelectSupermercado" 
            />
          <my-input 
            class="mb-4" 
            placeholder="Introducir nombre de producto" 
            v-model="nuevoProducto" 
            :autofocus="true" 
            :maxLength="maxLenght" 
            @keyPressed:enter="handleAddClick" 
            />
          <my-button 
            text="Añadir" 
            @click="handleAddClick" 
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
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
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
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </my-card>
      </template>
      <template v-slot:tabContent4> <!-- Shopping List -->
        <div class="mr-0 d-flex">
          <my-select 
            class="flex-grow-1"
            :options="supermercados.filter(item=>item.id!=0)" 
            :selected="supermercados[1]" 
            @click="handleClickSupermercadoSL" 
            @select="handleSelectSupermercadoSL" 
            />
          <my-button 
          btnClass="danger" 
          class="clearList" 
          text="Limpiar Lista" 
          @click="clearList" />
        </div>
        <my-card 
          borderStyle="rounded-bottom"
          :height="alturaDisponible" 
          :heightModifier="-50" 
          >
          <div v-show="
              productosVisibles.some(item=>
              item.selected 
              && (item.id_supermercado==(supermercadoSL.value?.id) || item.id_supermercado==0) 
              && !item.done
              )"
            >
            <div class="w-100 text-center mt-2">Se puede comprar en {{ supermercadoSL.value?.text }}<hr /></div>
            <my-product-list 
              orderBy="categoryId" 
              :canBeDone="true" 
              :hideDone="true" 
              :productList="productosVisibles" 
              :selected="true" 
              :supermercado="supermercadoSL.value?.id || 0" 
              @click:product="handleShoplistClick" 
              />
          </div>
          <div v-show="(
            productosVisibles.some(item=>
              item.selected 
              && !item.done 
              && (item.id_supermercado!=(supermercadoSL.value?.id||0) && (item.id_supermercado!=0))
            )
          ) || 0">
            <div class="w-100 text-center">Para comprar en otros Supermercados<hr /></div>
            <my-product-list 
              orderBy="categoryId" 
              :canBeDone="true" 
              :hideDone="true" 
              :hideSupermercado="true" 
              :productList="productosVisibles" 
              :selected="true" 
              :supermercado="supermercadoSL.value?.id || 0" 
              @click:product="handleShoplistClick" 
              />
          </div>
          <div v-show="(
            productosVisibles.some(item=>
              item.done
            )
          )">
            <div class="w-100 text-center">Ya comprado<hr /></div>
            <my-product-list 
              orderBy="categoryId" 
              :canBeDone="true" 
              :productList="productosVisibles" 
              :selected="true" 
              :showOnlyDone="true" 
              @click:product="handleShoplistClick" 
              />
          </div>
        </my-card>
      </template>
    </my-tab>
  </div>
  <div id="anchorEditarProducto" class="d-none">
    <div id="divEditarProducto">
      <my-categories-list 
        ref="categoriesSliderRef" 
        :categories="categoriesData" 
        :selectCategory="productoSeleccionado?.id_categoria || 0" 
        @categorySelected="handleCategorySelected" 
        />
      <my-select 
        placeholder="Selecciona un supermercado" 
        ref="selectRef" 
        :options="supermercados" 
        @select="handleSelectSupermercado" 
        />
      <my-input 
        v-model="productoAEditar" 
        :maxLength="maxLenght" 
        :placeholder="productoAEditar"
      />
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
  import { v4 as uuidv4 }             from 'uuid'
  import { computed, ref, watch }     from 'vue'
  import { useStore }                 from 'vuex'
  import axios                      from 'axios'

  const focusInput = input => { input.focus(); input.setSelectionRange(input.value.length,input.value.length) }
  const refreshClearList=()=>document.querySelector(".clearList button").style.width=`${document.querySelector(".nav-item:last-child").getClientRects()[0].width}px`
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
        inputText:            '',
        nuevoProducto:        '',
        productoAEditar:      '',
        configs2Export:       [],
        productoSeleccionado: {},
      }
    },
    methods:{
      setFullScreen(){
        if (!this.fullScreen) return document.fullscreenElement?document.exitFullscreen():null
        if (document.fullscreenElement) return
        const    elemento=document.getElementById("appContainer");
        if      (elemento.requestFullscreen       ) elemento.requestFullscreen()
        else if (elemento.mozRequestFullScreen    ) elemento.mozRequestFullScreen()
        else if (elemento.webkitRequestFullscreen ) elemento.webkitRequestFullscreen()
        else if (elemento.msRequestFullscreen     ) elemento.msRequestFullscreen()
      },
      handleChangeFullScreen(checked){ this.configFullScreen=checked },
      handleClickSupermercadoSL(){
        if (!this.allowClick) clearTimeout(this.allowClickTimeout)
        this.allowClick=false;
        this.allowClickTimeout=this.doAllowClick();
      },
      handleChangeTabActive(data){ this.changes2Save.defaultTabActive=data },
      handleEditarProducto(){
        let aux=document.getElementById("divEditarProducto");
        this.productoAEditar=this.productoSeleccionado.text
        Swal.fire({
          title:              `Editar Producto<br>«${this.productoSeleccionado.text}»`,
          html:               '<div id="VueSweetAlert2"></div>',
          showCancelButton:   true,
          confirmButtonText:  'Confirmar',
          cancelButtonText:   'Cancelar',
          target:             document.querySelector("#appContainer"),
          willOpen: ()=>{
            this.$refs.categoriesSliderRef.seleccionarCategoria(this.productoSeleccionado.id_categoria)
            this.$refs.selectRef.selectOption(this.supermercados[findIndexById(this.productoSeleccionado.id_supermercado,this.supermercados)])
            document.getElementById('VueSweetAlert2').appendChild(aux);
          },
          didOpen:  ()=>{setTimeout(this.$refs.categoriesSliderRef.centrarCategoriaActiva,10)},
          willClose:()=>{document.getElementById('anchorEditarProducto').appendChild(aux)}
        }).then((result) => {
          if (result.isConfirmed){
            const areTheSame=(a,b)=>(Object.keys(a).length!==Object.keys(b).length)?false:Object.keys(a).every(key => key in b && a[key] === b[key])
            let newData={
              id:this.productoSeleccionado.id,
              text:this.productoAEditar,
              id_categoria:this.categoriaActiva.value.id,
              id_supermercado:this.supermercadoActivo.value.id,
              amount: 1,              
              selected: false,
              done: false,
            }
            if (!areTheSame(this.productoSeleccionado,newData)){
              this.productsData[findIndexById(newData.id, this.productsData)] = newData;
              this.productsData=[...this.productsData]
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
            confirmButton: 'btn btn-danger mb-2 mr-1', 
            cancelButton: 'btn btn-success mb-2', 
          },
          buttonsStyling: false, 
          target: document.querySelector("#appContainer"),
        }).then((result) => {
          if (result.isConfirmed){
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
      //funcion para hacer llamada mediante axios
      async getAPIData() {
        let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.IjIxMjU2ZDcxY2NkNDY1MzIyNGNjNjZjMDIxMjU0ZWFiIg.phW3GjYIY_SIUjDTQtyYymzjud2MJ3pmUoh8ARrZRUo';
        let urlbase='https://www.infoinnova.es/lolo/api';
        try {
          const response = await axios.post(urlbase+'/login', {
            email: 'trystan4861@gmail.com',
            pass: '21256d71ccd4653224cc66c021254eab',
            token
          }, {
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          });
          console.log(response.data);
          return response.data;
        } catch (error) {
          console.error('Error:', error);
          throw error;
        }
      },
      doAllowClick(timeOut=1000){
        return setTimeout(() => {
          this.allowClick=true
        }, timeOut)
      },
      handleShoplistClick(product){
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
            confirmButton: 'btn btn-success mr-1 mb-2', 
            denyButton: 'btn btn-danger mb-2 mr-1',
            cancelButton: 'btn btn-primary mb-2',
          },
          buttonsStyling: false, 
          showDenyButton: true, 
          denyButtonText: 'Eliminar Producto', 
          target: document.querySelector("#appContainer"),
        }).then((result) => {
          if (result.isConfirmed) this.handleEditarProducto()
          else if (result.isDenied) this.handleEliminarProducto()
        });
      },
      handleTabHeightChanged(data){
        this.alturaDisponible=data;
        refreshClearList()
      },
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
      handleCategorySelected(category){ this.categoriaActiva.value = category; },
      handleCategoryLongClick(categoria){
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
            confirmButton: 'btn btn-danger mr-1', 
            cancelButton: 'btn btn-success', 
          },
          buttonsStyling: false, 
          target: document.querySelector("#appContainer"),
        }).then((result) => {
          if (result.isConfirmed){
            this.productsData.forEach(producto=>{
              producto.selected=false
              producto.done=false
            })
            this.productsData=[...this.productsData]
          }
        });      
      },
      handleAddClick(){
        if (this.nuevoProducto===''){
          Swal.fire({
            icon:'error',
            title:'Error',
            text:'Debes introducir un nombre para el nuevo producto',
            confirmButtonText:'Aceptar',
            target: document.querySelector("#appContainer"),
          })
          return false;
        }
        if (!this.productsData.some(producto => producto.text.toLowerCase() === this.nuevoProducto.toLowerCase())){
          this.productsData.push({
            id:uuidv4(),
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
      configuracion: function(){
        return useStore().getters.getConfiguration()
      },
    },
    setup(){
      const store                   = useStore()
      const storeGet                = store.getters
      const ignoreLongClickTimeout  = ref(0)
      const maxLenght               = storeGet.getMaxLenght()
      const saveProductsState       = storeGet.getSaveProductsState()
      const controlY                = ref(-1)
      const allowClick              = ref(true)
      const allowClickTimeout       = ref(0)
      const alturaDisponible        = ref(storeGet.getAlturaDisponible())
      const categoriasVisibles      = ref([])

      const initialData             = storeGet.getConfiguration()
      const CONFIG_NAMES            = storeGet.getConfigNames()
      const tabsData                = storeGet.getTabs()
      const supermercados           = storeGet.getSupermercados()

      const productsData            = ref(getDataFromLocalStorage('productos'       ))
      const categoriesData          = ref(getDataFromLocalStorage('categorias'      ))
      const defaultTabActive        = ref(getDataFromLocalStorage('defaultTabActive'))
      const fullScreen          = ref(getDataFromLocalStorage('fullScreen'      ))
      const configFullScreen        = ref(fullScreen.value)

      let tempCategoriasVisiblesIds=[]

      const changes2Save={
        categoriasVisibiles:false,
        defaultTabActive: defaultTabActive.value
      }

      if (typeof categoriesData.value[0]==='undefined') categoriesData.value=initialData.categorias;

      const heightDesviation= computed(()=>useStore().getters.getHeightDesviation())
      const categoriasVisiblesIds=computed(()=>[...categoriesData.value.map(item=>({...item})).filter(item=>item.visible).map(item=>item.id)])
      const productosVisibles=computed(()=>productsData.value.filter(producto => categoriasVisiblesIds.value.includes(producto.id_categoria)))

      const categoriaActiva = ref({})
      const supermercadoActivo=ref({})
      const supermercadoSL=ref({})
      supermercadoSL.value=supermercados[1]
      function handleCategoriesChecked(data)
      {
      let aux=categoriesData.value.map(categoria => ({ ...categoria }))
          aux.forEach((item,index)=>item.visible=data.includes(index))
          categoriasVisibles.value=aux
          tempCategoriasVisiblesIds=[...data]
          changes2Save.categoriasVisibiles=true
      }      
      function getDataFromLocalStorage(index){
          let storedData = localStorageService.getSubItem(index);
          if (storedData) if (index != 'configuracion' ) store.dispatch(`set${index.replace(/\b\w/g,c=>c.toUpperCase())}`, storedData);

          return storedData ? storedData : localStorageService.setSubItem(index, initialData[index]);
      }

      watch(alturaDisponible,(newData)=>{ 
        if(Math.abs(newData-screen.availHeight)==Math.abs(heightDesviation.value)){
          store.dispatch('setAlturaDisponible',localStorageService.setSubItem('alturaDisponible', newData)) 
        }
      })
      watch(productsData,(newData)=>{ store.dispatch('setProductos',localStorageService.setSubItem('productos', newData)) })
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

      function handleImportConfigurationFile(data){
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
          defaultTabActive.value=changes2Save.defaultTabActive
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
      }
      watch(categoriesData,   newData => store.dispatch('setCategorias',       localStorageService.setSubItem('categorias',       newData)))
      watch(productsData  ,   newData => store.dispatch('setProductos',        localStorageService.setSubItem('productos',        newData)));
      watch(fullScreen,       newData => store.dispatch('setFullScreen',       localStorageService.setSubItem('fullScreen',       newData)));
      watch(defaultTabActive, newData => store.dispatch('setDefaultTabActive', localStorageService.setSubItem('defaultTabActive', newData)));

      return {
        allowClick,
        allowClickTimeout,
        alturaDisponible,
        categoriaActiva,
        categoriasVisibles,
        categoriasVisiblesIds,
        categoriesData,
        changes2Save,
        CONFIG_NAMES,
        configFullScreen,
        defaultTabActive,
        fullScreen,
        handleCategoriesChecked,
        handleDragCard,
        handleImportConfigurationFile,
        handleImportConfigurationFileError,
        heightDesviation,
        ignoreLongClickTimeout,
        maxLenght,
        productosVisibles,
        productsData,
        releaseIgnoreLongClick,
        saveConfigChanges,
        saveProductsState,
        store,
        storeGet,
        supermercadoActivo,
        supermercados, 
        supermercadoSL,
        tabsData, 
        tempCategoriasVisiblesIds,
      }
    },
    mounted(){
      this.supermercadoActivo.value = this.supermercados[0]; 
      this.supermercadoSL.value     = this.supermercados[1]
      document.addEventListener('contextmenu', (event) => event.preventDefault())
      window.addEventListener('resize', refreshClearList,{passive: true});
      setTimeout(this.nuevoProductoFocus,500); 
      setTimeout(refreshClearList,500)
    },
  }
</script>

<style>
  #app                            { height:           100%  !important; }
  html,body                       { 
                                    --bs-body-bg:     black; 
                                    --bs-body-color:  white; 
                                    display:          flex; 
                                    flex-direction:   column; 
                                    height:           100vh; 
                                    margin:           0; 
                                    overflow:         hidden; 
                                    padding:          0; 
                                  }
  div:where(.swal2-container) hr  { 
                                    margin:           .5rem auto !important;  
                                    text-align:       center; 
                                    width:            60%; 
                                  }
  ::-webkit-scrollbar             { height:           4px; width: 4px;  }
  ::-webkit-scrollbar-track       { background:     #f0f0f0;          }
  ::-webkit-scrollbar-thumb       { background:     #888;             }
  ::-webkit-scrollbar-thumb:hover { background:     #555;             }
  .author                         { 
                                    font-size:        xx-small;
                                    left:             -15px; 
                                    margin:           auto;
                                    position:         relative;
                                    top:              calc(-10px + 0.15vw);
                                    width:            fit-content;
                                  }
  .clearList button               { 
                                    border-radius:    0px !important; 
                                  }
  .container                      { 
                                    display:          flex; 
                                    height:           100%; 
                                    flex-direction:   column; 
                                    flex-grow:        1;  
                                  }
  .logo                           { width:            60px;             }
  .ml-3                           { margin-left:      1rem !important;  }
  .mr-3                           { margin-right:     1rem !important;  }
  .mr-1                           { margin-right:     .25rem !important;}
  .mr-0                           { margin-right:     0rem !important;  }
  .overflow-hidden                { overflow:         hidden;           }
  .pr-0                           { padding-right:    0 !important;     }
  .swal2-html-container           { 
                                    z-index:          10 !important; 
                                    overflow:         visible !important; 
                                  }
  .swal2-input                    { 
                                    left:             50%; 
                                    margin:           20px 0 0; 
                                    position:         relative; 
                                    transform:        translateX(-50%); 
                                    width:            100%; 
                                  }
  .swal2-title                    { font-size:        1.5rem;           }
  .tabs-container                 { 
                                    display:          flex; 
                                    flex-direction:   column; 
                                    flex-grow:        1;  
                                    overflow-y:       auto; 
                                  }
  .touch                          { 
                                    height:           150px; 
                                    background:       gray; 
                                    margin-top:       10px; 
                                    justify-content:  center; 
                                    display:          flex; 
                                    align-items:      center; 
                                    user-select:      none; 
                                  }
</style>