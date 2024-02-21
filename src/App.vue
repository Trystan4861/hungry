<template>
  <div class="container mt-5">
    <h1 class="mb-4 text-center">Hungry!<MyImageLoader :image="'hungry.svg'" :className="'logo'" /></h1>
    <MyTab :tabs="tabsData" :defaultActive="defaultTabActive" @tabHeightChanged="handleTabHeightChanged">
      <template v-slot:tabContent0> <!-- Configuration -->
        <MyCard>
          <p>Selecciona qué configuración deseas exportar:</p>
          <MyCheckbox v-for="index in [0,1]" :key="index" :value="index" :label="CONFIG_NAMES[index]" v-model:checkedValues="configs2Export" :group="'configs2Export'" @lastCheckedDeletionAttempt="handleConfigLastCheckedDeletionAttempt" @update:checkedValues="handleUpdateConfigCheckedValues" />
          <br>
          <MyButton :text="'Exportar Configuración Seleccionada'" @click="exportConfig" />
        </MyCard>
        <MyCard :borderStyle="'rounded-bottom'">
          <MyFileReader :text="'Importar Configuración'" @fileReaded="handleFileReaded" @fileReadError="handeFileReadError" :maxFileSize="20*1024" :accept="'application/json'"/>
        </MyCard>
      </template>
      <template v-slot:tabContent1> <!-- Add new product -->
        <MyCategoriesList :categories="categoriesData" @categorySelected="handleCategorySelected" @categoryLongClick="handleCategoryLongClick" />
        <MySelect :options="supermercados" v-model="supermercado" selectName="supermercado" @select="handleSelect" />
        <MyInput v-model="nuevoProducto" :placeholder="'Añade elementos aquí'" :autofocus="true" />
        <MyButton text="Añadir" @click="handleAddClick" />
        <MyModal 
          ref="myModalRef"
          :title="`Cambiar «${categoria?.text}»`" 
          message="Introduzca un nuevo nombre para la categoría" 
          :value="inputText"
          @inputModalChange="handleInputModalChange"
        />
      </template>    
      
      <template v-slot:tabContent2> <!-- orderBy name -->
        <MyCard :min-height="alturaDisponible" :heightModifier="-152" :borderStyle="'rounded-bottom'">
          <MyProductList 
            :productList="productsData" 
            orderBy="name"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </MyCard>
      </template>
      
      <template v-slot:tabContent3> <!-- orderBy categoryId,name -->
        <MyCard :min-height="alturaDisponible" :heightModifier="-152" :borderStyle="'rounded-bottom'">
          <MyProductList 
            :productList="productsData" 
            orderBy="categoryId"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </MyCard>
      </template>

      <template v-slot:tabContent4> <!-- Shopping List -->
        <MySelect :options="supermercados" selectName="supermercado" @select="handleSelect" :selectedValue="-1" />
        <MyCard :min-height="alturaDisponible" :heightModifier="-202" :borderStyle="'rounded-bottom'">
          <MyProductList :productList="productsData" orderBy="categoryId" :selected="true" :canBeDone="true" @click:product="handleShoplistClick" />
        </MyCard>
      </template>
    </MyTab>
  </div>
</template>

<script>
import { localStorageService } from './localStorageService.js';
import MyCard from './components/MyCard.vue';
import MyCategoriesList from './components/MyCategoriesList.vue';
import MyCheckbox from './components/MyCheckbox.vue';
import MyTab from './components/MyTab.vue';
import MyModal from './components/MyModal.vue';
import MyInput from './components/MyInput.vue';
import MyButton from './components/MyButton.vue';
import MySelect from './components/MySelect.vue';
import MyProductList from './components/MyProductList.vue';
import MyImageLoader from './components/MyImageLoader.vue';
import MyFileReader from './components/MyFile.vue';

import { ref } from 'vue';
import Swal from 'sweetalert2';
/**logos **/
const LOCAL_STORAGE_KEYS = ['categoriesData','productsData'];
const INDEX_CATEGORIAS=0;
const INDEX_PRODUCTOS=1;

const initialData = [
  [
    {id:0,text:'Categoría 1', bgColor:'#d83c3d'},
    {id:1,text:'Categoría 2', bgColor:'#d8993c'},
    {id:2,text:'Categoría 3', bgColor:'#b9d83c'},
    {id:3,text:'Categoría 4', bgColor:'#5bd83c'},
    {id:4,text:'Categoría 5', bgColor:'#3dd87a'},
    {id:5,text:'Categoría 6', bgColor:'#47ffff'},
    {id:6,text:'Categoría 7', bgColor:'#3b7ad7'},
    {id:7,text:'Categoría 8', bgColor:'#5b3cd8'},
    {id:8,text:'Categoría 9', bgColor:'#b83cd8'},
    {id:9,text:'Categoría 10', bgColor:'#d83ba4'},
    {id:10,text:'Categoría 11', bgColor:'#6f1918'},
    {id:11,text:'Categoría 12', bgColor:'#704c1a'},
    {id:12,text:'Categoría 13', bgColor:'#5d6f19'},
    {id:13,text:'Categoría 14', bgColor:'#2b6f18'},
    {id:14,text:'Categoría 15', bgColor:'#1f8448'},
    {id:15,text:'Categoría 16', bgColor:'#196f70'},
    {id:16,text:'Categoría 17', bgColor:'#183c6e'},
    {id:17,text:'Categoría 18', bgColor:'#2c186f'},
    {id:18,text:'Categoría 19', bgColor:'#5e186e'},
    {id:19,text:'Categoría 20', bgColor:'#6e1952'},
  ],[]];

function downloadJSON(obj, filename = 'hungry.json') {
  const json = JSON.stringify(obj); // Convertir el objeto a formato JSON
  const blob = new Blob([json], { type:'application/json'}); // Crear un objeto Blob con el contenido JSON
  const link = document.createElement('a'); // Crear un enlace <a> para descargar el archivo
  link.href = URL.createObjectURL(blob);
  link.download = filename; // Establecer el nombre de archivo
  link.style.display= 'none'; // Ocultar el enlace y agregarlo al cuerpo del documento
  document.body.appendChild(link);
  link.click(); // Simular un clic en el enlace para iniciar la descarga
  document.body.removeChild(link); // Limpiar el enlace y el objeto Blob
  URL.revokeObjectURL(link.href);
}

export default {
  name:'App',
  components:{
    MyButton,
    MyCard,
    MyCategoriesList,
    MyCheckbox,
    MyFileReader,
    MyImageLoader,
    MyInput,
    MyModal,
    MyProductList,
    MySelect,
    MyTab,
  },
  data(){
    return{
      categoria:this.categoriesData[0].text,
      id_categoria:0,
      id_supermercado:-1,
      inputText:'',
      nuevoProducto:'', // Inicializa nuevoProducto con el valor deseado
      supermercado:'',
      configs2Export:[],
      defaultTabActive:2,
      alturaDisponible:0
    }
  },
  methods:{
    findIndex(product){return this.productsData.findIndex(item => item === product)},
    setAndSave(where,what)
    {
      if(where==LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS]) this.categoriesData=what
      else if(where==LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS]) this.productsData=what
      localStorageService.setItem(where, what);
    },
    exportConfig(){
      if (this.configs2Export.length==0)
        return Swal.fire({
          icon:'error',
          title:'Error',
          html:"Debe seleccionar al menos<br>una configuración a exportar",
          confirmButtonText:'Aceptar'
        })
      downloadJSON({name:'Hungry!',categorias:this.categoriesData,productos:this.productsData})
    },
    handleShoplistClick(product)
    {
      let index=this.findIndex(product)
      console.log(index)
      this.productsData[index].done=!this.productsData[index].done
    },
    handleClickProduct(product){
      let index=this.findIndex(product)
      this.productsData[index].selected=!this.productsData[index].selected
      this.productsData[index].done=false
    },
    handeLongClickProduct(product){
      console.log("longClick:product",product)
    },
    handleTabHeightChanged(data){
      this.alturaDisponible=data;
    },
    handleUpdateConfigCheckedValues(data){
      console.log(data);
    },
    handleConfigLastCheckedDeletionAttempt(data){
        console.log("swall")
        Swal.fire({
          icon:'error',
          title:'Error',
          html:"Debe seleccionar al menos<br>una configuración a exportar",
          confirmButtonText:'Aceptar'
        })
      console.log(data);
    },
    handleFileReaded(data){
      if (data.name!="Hungry!")
        return Swal.fire({
          icon:'error',
          title:'Error',
          html:"El archivo de configuración<br>no parece ser válido o está dañado",
          confirmButtonText:'Aceptar'
        })
      if (data.categorias)  this.setAndSave(LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS], data.categorias);
      if (data.productos) this.setAndSave(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS], data.productos);
        Swal.fire({
          icon:'success',
          title:'Atención',
          html:"Archivo de configuración<br>importado correctamente",
          confirmButtonText:'Aceptar'
        })
    },
    handeFileReadError(error){
        Swal.fire({
          icon:'error',
          title:'Error',
          html:error,
          confirmButtonText:'Aceptar'
        })
        return false;
    },
    handleInputModalChange(newText) {
      this.categoriesData[this.id_categoria].text = newText;
      localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS], this.categoriesData);
    },
    handleCategorySelected(category,index) {
      this.categoria = category;
      this.id_categoria= index;
      this.nuevoProducto = '';
    },
    handleCategoryLongClick(){
      this.inputText=this.categoria.text;
      this.$refs.myModalRef.openModal();
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
      if (this.id_supermercado<0)
      {
        Swal.fire({
          icon:'error',
          title:'Error',
          text:'Debes seleccionar qué supermercado asignarás a '+ this.nuevoProducto,
          confirmButtonText:'Aceptar'
        })
        return false;
      }
      this.productsData.push({id:this.productsData.length,text:this.nuevoProducto,categoria:this.categoriesData[this.id_categoria],id_categoria:this.id_categoria,supermercado:this.supermercados[this.id_supermercado],id_supermercado:this.id_supermercado});
      this.nuevoProducto="";
      localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS],this.productsData);
    },
    handleSelect(selected,index)
    {
      this.supermercado=selected.text;
      this.id_supermercado=index;
    }
  },
  setup() {
      const CONFIG_NAMES = ['Categorías','Productos'];
      document.title="Hungry! by trystan4861"; //forzamos el nombre para evitar que netlify ponga el que le de la gana
      const tabsData= ref([
        { logo:'config.svg'},
        { logo:'add.svg'},
        { logo:'a2z.svg'},
        { logo:'categorias.svg'},
        { logo:'cart.svg'},
      ]);
      const productsData=ref(getDataFromLocalStorage(INDEX_PRODUCTOS));
      const categoriesData = ref(getDataFromLocalStorage(INDEX_CATEGORIAS));
   
      function getDataFromLocalStorage(index=0) {
          const storedData = localStorageService.getItem(LOCAL_STORAGE_KEYS[index]);
          return (storedData)?storedData:localStorageService.setItem(LOCAL_STORAGE_KEYS[index], initialData[index]);
        }

      const supermercados=ref([
        {text:'Cualquier Supermercado', logo:'hungry.svg'},
        {text:'Carrefour', logo:'carrefour.svg'},
        {text:'Mercadona', logo:'mercadona.svg'},
        {text:'La Carmela', logo:'super_carmela.svg'},
      ])
      //const selectedSupermercado = ref('');
      return {tabsData, categoriesData,supermercados, productsData,CONFIG_NAMES}
  },
  mounted(){
    //this.categoriesData.value = getCategoriesDataFromLocalStorage();
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
#app{
  height: 100%!important;
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
  scrollbar-width: thin;
  scrollbar-color: #888 #f0f0f0;
}
.tabs-container::-webkit-scrollbar{
  width: 5px;
}
.tabs-container::-webkit-scrollbar-track{
  background: #f0f0f0;
}
.tabs-container::-webkit-scrollbar-thumb{
  background: #888;
}
.logo{
  width:60px;
}
/* Estilos globales de la aplicación */
</style>