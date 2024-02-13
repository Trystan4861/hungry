<template>
  <div class="container mt-5">
    <h1 class="mb-4">Hungry!</h1>
    <my-tab :tabs="tabsData" @tabChanged="handleTabChange">
      <template v-slot:tabContent0>
        <!-- Aquí puedes poner cualquier contenido que desees -->
        <div>
          <h2>Listado de Categorías</h2>
          <!-- Aquí iría el listado de categorías y el formulario para agregar/editar categorías -->
        </div>
      </template>    
      <!-- Contenido dinámico de la segunda pestaña -->
      <template v-slot:tabContent1>
        <!-- Aquí puedes poner cualquier contenido que desees -->
        <div>
          <h2>Listado Completo de Productos</h2>
          <!-- Aquí iría el listado completo de productos -->
        </div>
      </template>
      
      <!-- Contenido dinámico de la tercera pestaña -->
      <template v-slot:tabContent2>
        <!-- Aquí puedes poner cualquier contenido que desees -->
        <div>
          <h2>Listado Filtrado de Productos Marcados</h2>
          <!-- Aquí iría el listado filtrado de productos marcados -->
        </div>
      </template>
    </my-tab>
  </div>
</template>

<script>
import MyTab from './components/MyTab.vue';

export default {
  name: 'App',
  components: {
    MyTab
  },
  methods:{
    handleTabChange(index) {
      console.log('Se ha cambiado la pestaña a:', index);
      // Aquí puedes realizar cualquier acción adicional que desees
    }
  },
  data() {
    return {
      tabsData: [
        { title: 'Categorías', content: 'Contenido de la pestaña 1' },
        { title: 'Productos', content: 'Contenido de la pestaña 2' },
        { title: 'Lista', content: 'Contenido de la pestaña 3' },
      ]
    };
  }
};
</script>

<style>
/* Estilos globales de la aplicación */
</style>