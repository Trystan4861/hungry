<template>
  <div class="container mt-5">
    <h1 class="mb-4"><i class=""></i> Hungry!</h1>
    <my-tab :tabs="tabsData" @tabChanged="handleTabChange">
      <template v-slot:tabContent0>
        <MyCategoriesList :categories="categoriesData" @categorySelected="handleCategorySelected" />
        <p>Hola</p>
      </template>    
      
      <template v-slot:tabContent1>
        <div>

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
import { ref } from 'vue';

export default {
  name: 'App',
  components: {
    MyTab,
    MyCategoriesList
  },
  methods:{
    handleTabChange(index) {
      console.log('Se ha cambiado la pestaña a:', index);
      // Aquí puedes realizar cualquier acción adicional que desees
    },
    handleCategorySelected(category,index) {
      console.log(`Se ha cambiado la categoría a ${category.text} con indice ${index}`);
      // Aquí puedes realizar cualquier acción adicional que desees
    }

  },
  setup() {
      const tabsData= ref([
        { title: '+' },
        { title: 'A>Z' },
        { title: 'Por Categoría' },
        { title: 'Lista' },
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
      return {tabsData, categoriesData}
  }
};
</script>

<style>

body
{
  --bs-body-bg: black;
  --bs-body-color: white;
}
/* Estilos globales de la aplicación */
</style>