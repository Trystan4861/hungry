<template>
  <div class="container mt-5">
    <h1 class="mb-4">Hungry!<img class="logo" :src="hungryLogo"></h1>
    <my-tab :tabs="tabsData" @tabChanged="handleTabChange">
      <template v-slot:tabContent0>
        <MyCategoriesList :categories="categoriesData" @categorySelected="handleCategorySelected" @categoryLongClick="handleCategoryLongClick"/>
        <MySelect :options="supermercados" v-model="supermercado" selectName="supermercado" @select="handleSelect"/>
        <MyInput v-model="nuevoProducto" :placeholder="'Añade elementos aquí'" />
        <MyButton text="Añadir" @click="handleAddClick"/>
        <MyModal 
          ref="myModalRef"
          :title="`Cambiar «${categoria?.text}»`" 
          message="Introduzca un nuevo nombre para la categoría" 
          :value="inputText"
          @inputModalChange="handleInputModalChange"
        />
      </template>    
      
      <template v-slot:tabContent1>
        <MyProductList :productList="productos" orderBy="name"/>
      </template>
      
      <template v-slot:tabContent2>
        <MyProductList :productList="productos" orderBy="categoryId"/>
      </template>

      <template v-slot:tabContent3>
        <div>

        </div>
      </template>

    </my-tab>
  </div>
</template>

<script>
import MyCategoriesList from './components/MyCategoriesList.vue';
import MyTab from './components/MyTab.vue';
import MyModal from './components/MyModal.vue';
import MyInput from './components/MyInput.vue';
import MyButton from './components/MyButton.vue';
import MySelect from './components/MySelect.vue';
import MyProductList from './components/MyProductList.vue';
import { ref } from 'vue';
import Swal from 'sweetalert2';
/**logos **/
import hungryLogo from "./public/images/hungry.svg";
import carrefourLogo from "./public/images/carrefour.svg";
import carmelaLogo from "./public/images/super_carmela.svg";
import mercadonaLogo from "./public/images/mercadona.svg";
import addLogo from "./public/images/add.svg";
import a2zLogo from "./public/images/a2z.svg";
import categoriasLogo from "./public/images/categorias.svg";
import cartLogo from "./public/images/cart.svg";

export default {
  name: 'App',
  components: {
    MyTab,
    MyCategoriesList,
    MyModal,
    MyInput,
    MyButton,
    MySelect,
    MyProductList
  },
  data(){
    return{
      categoria: this.categoriesData[0].text,
      id_categoria:0,
      nuevoProducto: '', // Inicializa nuevoProducto con el valor deseado
      supermercado: '',
      id_supermercado:-1,
      inputText:'',
      productos:[],
      logo:hungryLogo
    }
  },
  methods:{
    handleInputModalChange(newText) {
      this.categoriesData[this.id_categoria].text = newText;
    },
    handleTabChange(index) {
      console.log('Se ha cambiado la pestaña a:', index);
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
      this.productos.push({text:this.nuevoProducto,categoria:this.categoriesData[this.id_categoria],id_categoria:this.id_categoria,supermercado:this.supermercados[this.id_supermercado],id_supermercado:this.id_supermercado});
      this.nuevoProducto="";
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
        { logo:addLogo },
        { title: '',logo:a2zLogo },
        { title: '',logo:categoriasLogo },
        { title: '',logo:cartLogo },
      ]);
      const categoriesData= ref([
        {text:'Carnicería', bgColor:'#d83c3d'},
        {text:'Verduras', bgColor:'#d8993c'},
        {text:'Productos Lácteos', bgColor:'#b9d83c'},
        {text:'', bgColor:'#5bd83c'},
        {text:'', bgColor:'#3dd87a'},
        {text:'', bgColor:'#47ffff'},
        {text:'', bgColor:'#3b7ad7'},
        {text:'', bgColor:'#5b3cd8'},
        {text:'', bgColor:'#b83cd8'},
        {text:'', bgColor:'#d83ba4'},
        {text:'', bgColor:'#6f1918'},
        {text:'', bgColor:'#704c1a'},
        {text:'', bgColor:'#5d6f19'},
        {text:'', bgColor:'#2b6f18'},
        {text:'', bgColor:'#1f8448'},
        {text:'', bgColor:'#196f70'},
        {text:'', bgColor:'#183c6e'},
        {text:'', bgColor:'#2c186f'},
        {text:'', bgColor:'#5e186e'},
        {text:'', bgColor:'#6e1952'},
      ]);
      const supermercados=ref([
        {text:'Cualquier Supermercado', logo:hungryLogo},
        {text:'Carrefour', logo:carrefourLogo},
        {text:'Mercadona', logo:mercadonaLogo},
        {text:'La Carmela', logo:carmelaLogo}
      ])
      //const selectedSupermercado = ref('');
      return {tabsData, categoriesData,supermercados,hungryLogo}
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