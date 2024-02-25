<template>
  <div class="container mt-5">
    <MyTab :tabs="tabsData" :defaultActive="defaultTabActive" @tabHeightChanged="handleTabHeightChanged" :alturaDisponible="alturaDisponible" >
      <template v-slot:tabContent0> <!-- Configuration -->
        <MyCard :min-height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <h1 class="text-center">Hungry!<MyImageLoader :image="'hungry.svg'" :className="'logo'" />
            <div class="text-center author">by Trystan4861</div>
          </h1>
          <SlotConfigurationExport :configNames="CONFIG_NAMES" />
          <SlotConfigurationImport @configurationFileReaded="handleImportConfigurationFile" @configurationFileError="handleImportConfigurationFileError" />
        </MyCard>
      </template>
      <template v-slot:tabContent1> <!-- Add new product -->
        <MyCard :min-height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <MyCategoriesList class="mb-4" :categories="categoriesData" @categorySelected="handleCategorySelected" @categoryLongClick="handleCategoryLongClick" />
          <MySelect :selected="supermercados[0]" :options="supermercados" selectName="supermercadoAdd" @select="handleSelectSupermercado" :placeholder="'Selecciona un supermercado'" />
          <MyInput class="mb-4" v-model="nuevoProducto" :placeholder="'Añade nuevos productos aquí'" :autofocus="true" />
          <MyButton text="Añadir" @click="handleAddClick" />
        </MyCard>
      </template>    
      
      <template v-slot:tabContent2> <!-- orderBy name -->
        <MyCard :min-height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <MyProductList 
            :productList="productsData" 
            orderBy="name"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </MyCard>
      </template>
      
      <template v-slot:tabContent3> <!-- orderBy categoryId,name -->
        <MyCard :min-height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <MyProductList 
            :productList="productsData" 
            orderBy="categoryId"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </MyCard>
      </template>

      <template v-slot:tabContent4> <!-- Shopping List -->
        <MyCard :min-height="alturaDisponible" :borderStyle="'rounded-bottom'">
          <MySelect :options="supermercados" selectName="supermercadoEdit" @select="handleSelectSupermercado" :selectedValue="-1" />
          <MyProductList :productList="productsData" orderBy="categoryId" :selected="true" :canBeDone="true" @click:product="handleShoplistClick" />
        </MyCard>
      </template>
    </MyTab>
  </div>
  <div id="anchorEditarProducto" class="d-none">
    <div id="divEditarProducto">
      <MyCategoriesList ref="categoriesSliderRef" :categories="categoriesData" :selectCategory="productoSeleccionado.id_categoria" />
      <MyInput v-model="productoAEditar" :placeholder="productoAEditar"/>
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

const LOCAL_STORAGE_KEYS = ['categoriesData','productsData'];
const INDEX_CATEGORIAS=0;
const INDEX_PRODUCTOS=1;

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
  },
  data(){
    return{
      inputText:'',
      nuevoProducto:'', // Inicializa nuevoProducto con el valor deseado
      productoAEditar:'',
      configs2Export:[],
      alturaDisponible:0,
      productoSeleccionado:{}
    }
  },
  methods:{
    findIndex(what,where){return where.findIndex(item => item === what)},
    findProductIndex(product){return this.findIndex(product,this.productsData)},
    findCategoryIndex(category){return this.findIndex(category,this.categoriesData)},
    setAndSave(where,what)
    {
      if (typeof where==='number') where=LOCAL_STORAGE_KEYS[where]
      if(where==LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS]) this.categoriesData=what
      else if(where==LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS]) this.productsData=what
      localStorageService.setItem(where, what);
    },
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
          const areTheSame=(categoryA, categoryB)=>{
            const keys1 = Object.keys(categoryA);
            const keys2 = Object.keys(categoryB);
            if (keys1.length !== keys2.length) return false;
            for (let key of keys1) {
              if (!(key in categoryB)) return false;
              if (categoryA[key] !== categoryB[key]) return false;
            }
            return true;
          }
          let newData={
            id:this.productoSeleccionado.id,
            text:this.productoAEditar,
            categoria:this.$refs.categoriesSliderRef.activeCategory,
            id_categoria:this.$refs.categoriesSliderRef.activeCategory.id_categoria
            }
          if (!areTheSame(this.productoSeleccionado,newData))
          {
            console.log("son distintos")
            console.log(this.productoAEditar)
            this.productsData[this.productsData.findIndex(p=>p.id==this.productoSeleccionado.id)]=newData
            localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS],this.productsData)
          }
           
          // Acción a realizar si se confirma el SweetAlert2
          // this.handleCategorySelectedEditProduct(vm.$props.selectedCategory); // Llama a la función con la categoría seleccionada
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
          cancelButton: 'btn btn-success', // Clase CSS para el botón de confirmación (Sí)
          confirmButton: 'btn btn-danger' // Clase CSS para el botón de cancelación (No)
        }
      }).then((result) => {
        if (result.isConfirmed) {
          let index=this.findProductIndex(this.productoSeleccionado)
          this.productsData.splice(index, 1)
          localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS],this.productsData)
          this.productoSeleccionado=null;
          this.$refs.myModalSlotRef.closeModal();

        }
      });
    },
    handleShoplistClick(product)
    {
      let index=this.findProductIndex(product)
      this.productsData[index].done=!this.productsData[index].done
    },
    handleClickProduct(product){
      let index=this.findProductIndex(product)
      if ('selected' in this.productsData[index])
        this.productsData[index].selected=!this.productsData[index].selected
      else
        this.productsData[index].selected=true;
      this.productsData[index].done=false
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
          confirmButton: 'btn btn-success', // Clase CSS para el botón de confirmación (Sí)
        },
        buttonsStyling: false, // Desactivar el estilo predefinido de los botones
        showDenyButton: true, // Mostrar el tercer botón
        denyButtonText: 'Eliminar Producto', // Texto del tercer botón
      }).then((result) => {
        if (result.isConfirmed) {
          this.handleEditarProducto()
        } else if (result.isDenied) {
          this.handleEliminarProducto()
        }
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
    handleCategorySelected(category) {
      this.categoriaActiva.value = category;
    },
    handleCategoryLongClick(categoria) {
      Swal.fire({
        title: `Cambiar «${categoria?.text}»`,
        text: 'Introduzca un nuevo nombre para la categoría',
        input: 'text',
        inputValue: categoria.text,
        showCancelButton: true,
        confirmButtonText: 'Guardar cambios',
        cancelButtonText: 'Cancelar',
        customClass: {
          cancelButton: 'btn btn-success', // Clase CSS para el botón de confirmación (Sí)
          confirmButton: 'btn btn-info' // Clase CSS para el botón de cancelación (No)
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const newText = result.value;
          this.categoriesData[categoria.id].text = newText;
          localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS], this.categoriesData);
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
      console.log({id:this.productsData.length,text:this.nuevoProducto,categoria:this.categoriaActiva.value,id_categoria:this.categoriaActiva.value.id,supermercado:this.supermercadoActivo.value,id_supermercado:this.supermercadoActivo.value.id})
      
//      this.productsData.push({id:this.productsData.length,text:this.nuevoProducto,categoria:this.categoriaActiva.value,id_categoria:this.id_categoria.value.id,supermercado:this.supermercados[this.id_supermercado],id_supermercado:this.id_supermercado});
      //this.nuevoProducto="";
      //localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS],this.productsData);
    },
    handleSelectSupermercado(selected)
    {
      //FIX refactorizar esto
      this.supermercadoActivo.value=selected.text;
    }
  },
  setup() {
      document.title="Hungry! by trystan4861"; //forzamos el nombre para evitar que netlify ponga el que le de la gana

      const store=useStore();
      const storeGet=store.getters;
      const defaultTabActive=storeGet.getDefaultTabActive()
      const initialData=[storeGet.getCategorias(),[]]
      const CONFIG_NAMES = storeGet.getConfigNames();
      const tabsData= storeGet.getTabs();
      const supermercados=storeGet.getSupermercados();

      const productsData=ref(getDataFromLocalStorage(INDEX_PRODUCTOS));
      const categoriesData = ref(getDataFromLocalStorage(INDEX_CATEGORIAS));

      if (typeof categoriesData.value[0]==='undefined') categoriesData.value=initialData[0];
      
      const categoriaActiva = ref({})
      const supermercadoActivo=ref({})

      function getDataFromLocalStorage(index = INDEX_CATEGORIAS) {
          let storedData = localStorageService.getItem(LOCAL_STORAGE_KEYS[index]);
          if (storedData)
          {
            if (index == INDEX_CATEGORIAS )
            {
              store.dispatch('setCategorias', storedData);
              if (storedData.some(category => !Object.prototype.hasOwnProperty.call(category, 'id')))
                  storedData = storedData.map((category, index) => ({ ...category, id: index }));
            }
            else if (index== INDEX_PRODUCTOS)
            {
              store.dispatch('setProductos', storedData);
            }
          }
          return storedData ? storedData : localStorageService.setItem(LOCAL_STORAGE_KEYS[index], initialData[index]);
      }
      watch(categoriesData,(newData)=>{
        localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS], newData);
        store.dispatch('setCategorias',newData)
        })
      watch(productsData,(newData)=>{
        localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS], newData);
        store.dispatch('setProductos',newData)
        })
      const handleImportConfigurationFileError=(error)=>
      {
        let html="";
        let title="Atención"
        switch (error) {
          case "ERROR_APPNAME":
            html="El archivo de configuración seleccionado<br>no es un archivo de configuración<br>de «Hungry!» válido o está dañado";
            break;
          default:
            title="ERROR INESPERADO"
            html=error
            break;
        }
        Swal.fire({
          icon:'error',
          title,
          html,
          confirmButtonText:'Aceptar'
        })
      }
      const handleImportConfigurationFile=(data)=>{
        let importado=[];
        if (Object.prototype.hasOwnProperty.call(data, 'categorias') && data.categorias.length>0) {
          categoriesData.value=data.categorias;
          importado.push("las categorias")
        }
        if (Object.prototype.hasOwnProperty.call(data, 'productos') && data.productos.length>0) {
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


      //const selectedSupermercado = ref('');
      return {
        store,
        CONFIG_NAMES,
        tabsData, 
        productsData,
        categoriesData,
        categoriaActiva,
        supermercadoActivo,
        supermercados, 
        defaultTabActive,
        handleImportConfigurationFile,
        handleImportConfigurationFileError,
    }
  },
  mounted(){
    setTimeout(this.nuevoProductoFocus,500);
  }
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
#app{ height: 100%!important; }
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
  scrollbar-width: thin;
  scrollbar-color: #888 #f0f0f0;
}
.tabs-container::-webkit-scrollbar { width: 5px; }
.tabs-container::-webkit-scrollbar-track { background: #f0f0f0; }
.tabs-container::-webkit-scrollbar-thumb { background: #888; }
.logo { width:60px; }
.author {
  font-size: xx-small;
  width: fit-content;
  margin: auto;
  position: relative;
  top: -15px
}
</style>