<template>
  <div class="container mt-5">
    <MyTab :tabs="tabsData" :defaultActive="defaultTabActive" @tabHeightChanged="handleTabHeightChanged" :alturaDisponible="alturaDisponible" >
      <template v-slot:tabContent0> <!-- Configuration -->
        <MyCard :height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <h1 class="text-center"><span class="appName">Hungry!</span><MyImageLoader :image="'hungry.svg'" :className="'logo'" />
            <div class="text-center author">by Trystan4861</div>
          </h1>
          <SlotConfigurationCategories @categoriesChecked="handleCategoriesChecked" @buttonClicked="handleCategoriesButtonClicked" />
          <SlotConfigurationExport :configNames="CONFIG_NAMES" />
          <SlotConfigurationImport @configurationFileReaded="handleImportConfigurationFile" @configurationFileError="handleImportConfigurationFileError" />
        </MyCard>
      </template>
      <template v-slot:tabContent1> <!-- Add new product -->
        <MyCard :height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <MyCategoriesList class="mb-4" :categories="categoriesData" @categorySelected="handleCategorySelected" @categoryLongClick="handleCategoryLongClick" />
          <MySelect :selected="supermercados[0]" :options="supermercados" selectName="supermercadoAdd" @select="handleSelectSupermercado" :placeholder="'Selecciona un supermercado'" />
          <MyInput :maxLength="maxLenght" class="mb-4" v-model="nuevoProducto" :placeholder="'Añade nuevos productos aquí'" :autofocus="true" @keyPressed:enter="handleAddClick" />
          <MyButton text="Añadir" @click="handleAddClick" />
        </MyCard>
      </template>    
      <template v-slot:tabContent2> <!-- orderBy name -->
        <MyCard :height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <MyProductList 
            :productList="productosVisibles" 
            orderBy="name"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </MyCard>
      </template>
      <template v-slot:tabContent3> <!-- orderBy categoryId,name -->
        <MyCard :height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <MyProductList 
            :productList="productosVisibles" 
            orderBy="categoryId"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </MyCard>
      </template>
      <template v-slot:tabContent4> <!-- Shopping List -->
        <div class="row">
          <div class="col-9 pr-0">
            <MySelect :options="supermercados.filter(item=>item.id!=0)" :selected="supermercados[1]" selectName="supermercadoEdit" @select="handleSelectSupermercadoSL" />
          </div>
          <div class="col-3 p-0 overflow-hidden">
              <MyButton class="clearList" :text="'Limpiar Lista'" :btnClass="'danger'" @click="clearList" />
          </div>
        </div>
        <MyCard :height="alturaDisponible" :heightModifier="-50" :borderStyle="'rounded-bottom'">
          <div v-show="
          productosVisibles.some(item=>
            item.selected 
            && (item.id_supermercado==(supermercadoSL.value?.id) || item.id_supermercado==0) 
            && !item.done
          )">
            <div class="w-100 text-center mt-2">Se puede comprar en {{ supermercadoSL.value?.text }}<hr /></div>
            <MyProductList :productList="productosVisibles" orderBy="categoryId" :supermercado="supermercadoSL.value?.id || 0" :selected="true" :canBeDone="true" :hideDone="true" @click:product="handleShoplistClick" />
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
            <MyProductList :productList="productosVisibles" orderBy="categoryId" :selected="true" :supermercado="supermercadoSL.value?.id || 0" :hideSupermercado="true" :canBeDone="true" :hideDone="true" @click:product="handleShoplistClick" />
          </div>
          <div v-show="productosVisibles.some(item=>item.done)">
            <div class="w-100 text-center">Ya comprado<hr /></div>
            <MyProductList :productList="productosVisibles" orderBy="categoryId" :selected="true" :canBeDone="true" :showOnlyDone="true" @click:product="handleShoplistClick" />
          </div>
        </MyCard>
      </template>
    </MyTab>
  </div>
  <div id="anchorEditarProducto" class="d-none">
    <div id="divEditarProducto">
      <MyCategoriesList ref="categoriesSliderRef" :categories="categoriesData" :selectCategory="productoSeleccionado?.id_categoria || 0" @categorySelected="handleCategorySelected" />
      <MySelect ref="selectRef" :options="supermercados" selectName="supermercadoEdit" @select="handleSelectSupermercado" :placeholder="'Selecciona un supermercado'" />
      <MyInput :maxLength="maxLenght" v-model="productoAEditar" :placeholder="productoAEditar"/>
    </div>
  </div> 
</template>

<script>
import { localStorageService }  from './localStorageService.js';
import MyCard                   from './components/MyCard.vue';
import MyCategoriesList         from './components/MyCategoriesList.vue';
import MyTab                    from './components/MyTab.vue';
import MyInput                  from './components/MyInput.vue';
import MyButton                 from './components/MyButton.vue';
import MySelect                 from './components/MySelect.vue';
import MyProductList            from './components/MyProductList.vue';
import MyImageLoader            from './components/MyImageLoader.vue';
import { ref, watch }           from 'vue';
import { useStore }             from 'vuex';
import Swal                     from 'sweetalert2';
import SlotConfigurationExport  from './components/SlotConfigurationExport.vue';
import SlotConfigurationImport  from './components/SlotConfigurationImport.vue';
import SlotConfigurationCategories from './components/SlotConfigurationCategories.vue'

const LOCAL_STORAGE_KEYS = ['categoriesData','productsData','alturaDisponibleData'];
const INDEX_CATEGORIAS=0;
const INDEX_PRODUCTOS=1;
const INDEX_ALTURA_DISPONIBLE=2;

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
    SlotConfigurationExport,
    SlotConfigurationImport,
    SlotConfigurationCategories,
  },
  data(){
    return{
      inputText:'',
      nuevoProducto:'',
      productoAEditar:'',
      configs2Export:[],
      productoSeleccionado:{},
      categoriasVisibles:null,
    }
  },
  methods:{
    findIndexById(whatID,where){return where.findIndex(item=>item.id==whatID)},
    handleEditarProducto(){
      let aux=document.getElementById("divEditarProducto");
      this.productoAEditar=this.productoSeleccionado.text
      Swal.fire({
        title: `Editar «${this.productoSeleccionado.text}»`,
        html: '<div id="VueSweetAlert2"></div>',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        willOpen:()=>{
          this.$refs.categoriesSliderRef.seleccionarCategoria(this.productoSeleccionado.id_categoria);
          if (this.productoSeleccionado.supermercado)
            this.$refs.selectRef.selectOption(this.productoSeleccionado?.supermercado)
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
              this.productsData[this.findIndexById(newData.id, this.productsData)] = newData;
              this.productsData=[...this.productsData]
              Swal.fire({
                title:'Atención',
                icon: 'success',
                text: 'Producto modificado correctamente'
              })
          }
          else{
              Swal.fire({
                title:'Atención',
                icon: 'info',
                text: 'No has realizado cambios al producto'
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
      }).then((result) => {
        if (result.isConfirmed) {
          this.productsData = this.productsData.filter(item => item.id !== this.productoSeleccionado.id)
          this.productoSeleccionado=null;
          Swal.fire({
            title:'Atención',
            icon: 'success',
            text: 'Producto eliminado correctamente'
          })
        }
      });
    },
    handleShoplistClick(product)
    {
      let index=this.findIndexById(product.id,this.productsData)
      this.productsData[index].done=!this.productsData[index].done
      if (this.saveProductsState) this.productsData=[...this.productsData]
    },
    handleClickProduct(product){
      let index=this.findIndexById(product.id,this.productsData)
      if (index!=-1)
      {
        this.productsData[index].selected=(Object.prototype.hasOwnProperty.call(this.productsData[index], 'selected'))?!this.productsData[index].selected:true
        this.productsData[index].done=false
        if (this.saveProductsState) this.productsData=[...this.productsData]
      }
      else throw new Error('Error id de producto no encontrado en la lista de productos')
    },
    handeLongClickProduct(product){
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
          confirmButtonText:'Aceptar'
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
        didOpen: ()=>{
          setTimeout(()=>{
            let input=document.querySelector("#inputModifyCategory")
            input.focus()
            input.setSelectionRange(input.value.length,input.value.length)
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
          confirmButtonText:'Aceptar'
        })
        return false;
      }
      if (!this.productsData.some(producto => producto.text.toLowerCase() === this.nuevoProducto.toLowerCase()))
      {
        this.productsData.push({
          id:this.productsData.length,
          text:this.nuevoProducto,
          categoria:this.categoriaActiva.value,
          id_categoria:this.categoriaActiva.value.id,
          supermercado:this.supermercadoActivo.value,
          id_supermercado:this.supermercadoActivo.value.id
        });
        this.nuevoProducto="";
        this.productsData=[...this.productsData]
      }
      else
        Swal.fire({
          icon:'warning',
          title: 'Atención',
          html: `Ya existe un producto llamado<br>«${this.nuevoProducto}»`
      })
    },
    handleSelectSupermercado(selected) { this.supermercadoActivo.value=selected },
    handleSelectSupermercadoSL(selected){this.supermercadoSL.value=selected},
    handleCategoriesChecked(data)
    {
      this.categoriasVisibles=this.categoriesData.map(categoria => ({ ...categoria }));
      this.categoriasVisibles.forEach((item,index)=>item.visible=data.includes(index))
      this.categoriasVisiblesIds=data
    },
    handleCategoriesButtonClicked(){
      this.categoriesData=this.categoriasVisibles
      Swal.fire({
          icon:'success',
          title:'Atención',
          html:`Cambibos guardados correctamente<br><br>Recuerda que todos los productos pertenecientes a categorías ocultas también estarán ocultos`,
          confirmButtonText:'Aceptar'
        })
    }
  },
  computed:{
    productosVisibles: function() {
        return this.productsData.filter(producto => this.categoriasVisiblesIds.includes(producto.categoria.id));
    },
    configuracion: function(){
      return useStore().getters.getConfiguracion();
    }
  },
  setup() {
      document.title="Hungry! by trystan4861"; //forzamos el nombre para evitar que netlify ponga el que le de la gana

      const store=useStore();
      const storeGet=store.getters;

      const defaultTabActive=storeGet.getDefaultTabActive()
      const maxLenght=storeGet.getMaxLenght()
      const saveProductsState=storeGet.getSaveProductsState()
      
      const alturaDisponible=ref()
      alturaDisponible.value=storeGet.getAlturaDisponible()

      const initialData=[storeGet.getCategorias(),[]]
      const CONFIG_NAMES = storeGet.getConfigNames();
      const tabsData= storeGet.getTabs();
      const supermercados=storeGet.getSupermercados();

      const productsData=ref(getDataFromLocalStorage(INDEX_PRODUCTOS));
      const categoriesData = ref(getDataFromLocalStorage(INDEX_CATEGORIAS));
      const categoriasVisiblesIds=ref([])

      if (typeof categoriesData.value[0]==='undefined') categoriesData.value=initialData[0];

      categoriasVisiblesIds.value=categoriesData.value.filter(item=>item.visible).map(item=>item.id)

      const categoriaActiva = ref({})
      const supermercadoActivo=ref({})
      const supermercadoSL=ref({})
      supermercadoSL.value=supermercados[0]
      function fixProductos(productos){
        productos.forEach(producto=> {
          if (!Object.prototype.hasOwnProperty.call(producto, 'supermercado')) producto.supermercado = { id: -1, text: null, logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==" }
          if (!Object.prototype.hasOwnProperty.call(producto, 'id_supermercado')) producto.id_supermercado = producto.supermercado.id

          if (!Object.prototype.hasOwnProperty.call(producto, 'categoria')) producto.categoria = categoriesData.value[0]
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
          }
          return storedData ? storedData : localStorageService.setItem(LOCAL_STORAGE_KEYS[index], initialData[index]);
      }
      watch(categoriesData,(newData)=>{ 
        store.dispatch('setCategorias',localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS], newData)) 
      })
      watch(alturaDisponible,(newData)=>{ 
        store.dispatch('setAlturaDisponible',localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_ALTURA_DISPONIBLE], newData)) 
      })
      watch(productsData,(newData)=>{ store.dispatch('setProductos',localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS], newData)) })
      const handleImportConfigurationFileError=(error)=>
      {
        Swal.fire({
          icon:'error',
          title:(error=="ERROR_APPNAME")?"Atención":"ERROR INESPERADO",
          html:(error!="ERROR_APPNAME")?error:"El archivo de configuración seleccionado<br>no es un archivo de configuración<br>de «Hungry!» válido o está dañado",
          confirmButtonText:'Aceptar'
        })
      }
      const handleImportConfigurationFile=(data)=>{
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
            confirmButtonText:'Aceptar'
          })
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
        CONFIG_NAMES,
        tabsData, 
        productsData,
        categoriesData,
        categoriaActiva,
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
::-webkit-scrollbar {width: 5px;}
::-webkit-scrollbar-track {background: #f1f1f1;}
::-webkit-scrollbar-thumb {background: #888;}
::-webkit-scrollbar-thumb:hover {background: #555;}

#app{ height: 100%!important; }
.swal2-input{
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
.clearList button
{
  border-radius: 0px !important;
  width: -webkit-fill-available;
}
.overflow-hidden
{
  overflow: hidden;
}
.pr-0{
  padding-right: 0 !important;
}
.ml-3 {
    margin-left: 1rem !important;
}
.mr-3 {
    margin-right: 1rem !important;
}
.mr-1{
  margin-right: .25rem !important;
}
</style>