<template>
  <div class="container mt-5">
    <h1 class="mb-4 text-center">Hungry!<MyImageLoader :image="'hungry.svg'" :className="'logo'" /></h1>
    <MyTab :tabs="tabsData" :defaultActive="1">
      <template v-slot:tabContent0>
        <MyButton :text="'Exportar Configuración'" @click="exportConfig" />
      </template>
      <template v-slot:tabContent1>
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
      
      <template v-slot:tabContent2>
        <MyProductList :productList="productsData" orderBy="name" />
      </template>
      
      <template v-slot:tabContent3>
        <MyProductList :productList="productsData" orderBy="categoryId" />
      </template>

      <template v-slot:tabContent4>
        <MySelect :options="supermercados" selectName="supermercado" @select="handleSelect" :selectedValue="-1" />
        <MyProductList :productList="productsData" orderBy="categoryId" />
      </template>
    </MyTab>
  </div>
</template>

<script>
import { localStorageService } from './localStorageService.js';
import MyCategoriesList from './components/MyCategoriesList.vue';
import MyTab from './components/MyTab.vue';
import MyModal from './components/MyModal.vue';
import MyInput from './components/MyInput.vue';
import MyButton from './components/MyButton.vue';
import MySelect from './components/MySelect.vue';
import MyProductList from './components/MyProductList.vue';
import MyImageLoader from './components/MyImageLoader.vue';

import { ref } from 'vue';
import Swal from 'sweetalert2';
/**logos **/
const LOCAL_STORAGE_KEYS = ['categoriesData','productsData'];
const INDEX_CATEGORIAS=0;
const INDEX_PRODUCTOS=1;

const initialData = [[
          {text:'Categoría 1', bgColor:'#d83c3d'},
          {text:'Categoría 2', bgColor:'#d8993c'},
          {text:'Categoría 3', bgColor:'#b9d83c'},
          {text:'Categoría 4', bgColor:'#5bd83c'},
          {text:'Categoría 5', bgColor:'#3dd87a'},
          {text:'Categoría 6', bgColor:'#47ffff'},
          {text:'Categoría 7', bgColor:'#3b7ad7'},
          {text:'Categoría 8', bgColor:'#5b3cd8'},
          {text:'Categoría 9', bgColor:'#b83cd8'},
          {text:'Categoría 10', bgColor:'#d83ba4'},
          {text:'Categoría 11', bgColor:'#6f1918'},
          {text:'Categoría 12', bgColor:'#704c1a'},
          {text:'Categoría 13', bgColor:'#5d6f19'},
          {text:'Categoría 14', bgColor:'#2b6f18'},
          {text:'Categoría 15', bgColor:'#1f8448'},
          {text:'Categoría 16', bgColor:'#196f70'},
          {text:'Categoría 17', bgColor:'#183c6e'},
          {text:'Categoría 18', bgColor:'#2c186f'},
          {text:'Categoría 19', bgColor:'#5e186e'},
          {text:'Categoría 20', bgColor:'#6e1952'},
        ],[]];

function downloadJSON(obj, filename = 'hungry.json') {
  // Convertir el objeto a formato JSON
  const json = JSON.stringify(obj);

  // Crear un objeto Blob con el contenido JSON
  const blob = new Blob([json], { type: 'application/json' });

  // Crear un enlace <a> para descargar el archivo
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);

  // Establecer el nombre de archivo
  link.download = filename;

  // Ocultar el enlace y agregarlo al cuerpo del documento
  link.style.display = 'none';
  document.body.appendChild(link);

  // Simular un clic en el enlace para iniciar la descarga
  link.click();

  // Limpiar el enlace y el objeto Blob
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export default {
  name: 'App',
  components: {
    MyTab,
    MyCategoriesList,
    MyModal,
    MyInput,
    MyButton,
    MySelect,
    MyProductList,
    MyImageLoader
  },
  data(){
    return{
      categoria: this.categoriesData[0].text,
      id_categoria:0,
      nuevoProducto: '', // Inicializa nuevoProducto con el valor deseado
      supermercado: '',
      id_supermercado:-1,
      inputText:'',
    }
  },
  methods:{
    exportConfig(){
      downloadJSON({categorias:this.categoriesData,productos:this.productsData})
    },
    handleInputModalChange(newText) {
      this.categoriesData[this.id_categoria].text = newText;
      localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS], this.categoriesData);

    },
    handleCategorySelected(category,index) {
      this.categoria=category;
      this.inputText=category.text;
      this.id_categoria=index;
      this.nuevoProducto='';
    },
    handleCategoryLongClick(){
      this.$refs.myModalRef.openModal();
    },
    handleAddClick(){
      if (this.nuevoProducto==='')
      {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debes introducir un nombre para el nuevo producto',
          confirmButtonText: 'Aceptar'
        })
        return false;
      }
      if (this.id_supermercado<0)
      {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debes seleccionar qué supermercado asignarás a ' + this.nuevoProducto,
          confirmButtonText: 'Aceptar'
        })
        return false;
      }
      this.productsData.push({text:this.nuevoProducto,categoria:this.categoriesData[this.id_categoria],id_categoria:this.id_categoria,supermercado:this.supermercados[this.id_supermercado],id_supermercado:this.id_supermercado});
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
      document.title="Hungry! by trystan4861"; //forzamos el nombre para evitar que netlify ponga el que le de la gana
      const tabsData= ref([
        { logo:'config.svg' },
        { logo:'add.svg' },
        { title: '',logo:'a2z.svg' },
        { title: '',logo:'categorias.svg' },
        { title: '',logo:'cart.svg' },
      ]);
      const productsData=ref(getDataFromLocalStorage(INDEX_PRODUCTOS));
      const categoriesData = ref(getDataFromLocalStorage(INDEX_CATEGORIAS));
   
      function getDataFromLocalStorage(index=0) {
          const storedData = localStorageService.getItem(LOCAL_STORAGE_KEYS[index]);
          if (storedData) {
            return storedData;
          } else {
            localStorageService.setItem(LOCAL_STORAGE_KEYS[index], initialData[index]);
            return initialData[index];
          }
        }

      const supermercados=ref([
        {text:'Cualquier Supermercado', logo:'hungry.svg'},
        {text:'Carrefour', logo:'carrefour.svg'},
        {text:'Mercadona', logo:'mercadona.svg'},
        {text:'La Carmela', logo:'super_carmela.svg'},
      ])
      //const selectedSupermercado = ref('');
      return {tabsData, categoriesData,supermercados, productsData}
  },
  mounted(){
    //this.categoriesData.value = getCategoriesDataFromLocalStorage();
    setTimeout(this.nuevoProductoFocus,500);
  }
};
</script>

<style>
body
{
  --bs-body-bg: black;
  --bs-body-color: white;
}
.logo{
  width: 60px;
}
/* Estilos globales de la aplicación */
</style>