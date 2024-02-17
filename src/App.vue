<template>
  <div class="container mt-5">
    <h1 class="mb-4">Hungry!<img class="logo" :src="logo"></h1>
    <my-tab :tabs="tabsData" @tabChanged="handleTabChange">
      <template v-slot:tabContent0>
        <MyCategoriesList :categories="categoriesData" @categorySelected="handleCategorySelected" @categoryLongClick="handleCategoryLongClick"/>
        <MySelect :options="supermercados" selectName="supermercado" />
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
        <div>
          <ul>
            <li v-for="(producto,index) in productos" :key="index">{{ producto }}</li>
          </ul>
        </div>
      </template>
      
      <template v-slot:tabContent2>
        <div>

        </div>
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
import { ref } from 'vue';
import logo from "@assets/hungry.svg";

export default {
  name: 'App',
  components: {
    MyTab,
    MyCategoriesList,
    MyModal,
    MyInput,
    MyButton,
    MySelect,
  },
  data(){
    return{
      categoria: this.categoriesData[0].text,
      id_categoria:0,
      nuevoProducto: '', // Inicializa nuevoProducto con el valor deseado
      inputText:'',
      productos:[],
      logo:logo
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
      console.log()
    }
  },
  setup() {
      const tabsData= ref([
        { title: '+' },
        { title: 'A>Z' },
        { title: 'Por Categoría' },
        { title: 'Para Comprar' },
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
        {text:'Cualquier Supermercado', logo:'@assets/hungry.svg'},
        {text:'Carrefour', logo:'@assets/carrefour.svg'},
        {text:'Mercadona', logo:'@assets/mercadona.svg'},
        {text:'La Carmela', logo:'@assets/super_carmela.svg'}
      ])
      //const selectedSupermercado = ref('');
      return {tabsData, categoriesData,supermercados}
  }
};
</script>

<style>
.console {
    background-color: grey;
    min-height: 500px;
    color: black;
}
body
{
  --bs-body-bg: black;
  --bs-body-color: white;
}
#agregarProducto {
  display: flex;
  height: 100% !important;
  width: 25%;
  margin-top: 3px;
  padding: 10px;
  justify-content: center;
}
#nuevoProducto
{
  height: 100%;
  width: 75%;
}
#agregarProductoWrapper
{
  height: 50px;
  display: flex;
}
.logo{
  width: 60px;
}
/* Estilos globales de la aplicación */
</style>