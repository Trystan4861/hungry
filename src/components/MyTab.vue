<template>
    <div class="my-tab">
      <ul class="nav nav-tabs">
        <!-- Mostramos cada pestaña en la cabecera -->
        <li class="nav-item" v-for="(tab, index) in tabs" :key="index">
          <a
            class="nav-link"
            :class="{ active: this.activeTab === index }"
            @click="activateTab(index)"
            
          >
            {{ tab.title }}
          </a>
        </li>
      </ul>
      <!-- Mostramos el contenido de la pestaña activa -->
      <div class="tab-content">
        <div class="tab-pane fade show" :class="{ active: this.activeTab === index }" :id="'tab' + index" v-for="(tab, index) in tabs" :key="index">
            <slot :name="'tabContent' + index"></slot>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MyTab',
    props: {
      tabs: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        activeTab: 0 // Índice de la pestaña activa
      };
    },
    methods: {
    activateTab(index) {
      this.activeTab = index;
      this.$emit('tabChanged', index);
    }
  }  };
  </script>
  
  <style scoped>
    a.nav-link
    {
        cursor: pointer;
    }
  /* No es necesario definir estilos adicionales ya que Bootstrap proporciona estilos */
  </style>