<template>
    <div class="my-tab">
      <ul class="nav nav-tabs">
        <!-- Mostramos cada pestaña en la cabecera -->
        <li class="nav-item" :class="{ active: this.activeTab === index }" v-for="(tab, index) in tabs" :key="index">
          <a
            class="nav-link"
            :class="{ active: this.activeTab === index }"
            @click="activateTab(index)">
            <img :src="tab.logo?tab.logo:emptyIMG" class="logo"> {{ tab.title }}
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
      activeTab: 0, // Índice de la pestaña activa
      emptyIMG:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII="

    };
  },
  methods: {
    activateTab(index) {
      this.activeTab = index;
      this.$emit('tabChanged', index);
    }
  },
  emits: ['tabChanged'], // Declarar el evento tabChanged para evitar la advertencia
};
</script>
  
<style scoped>
  .nav-tabs{
    justify-content: space-between;
  }
  .nav-tabs .nav-link{
    background-color: #585858;
    color: white;
    display: flex;
    justify-content: center;
  }
  .nav-item{
    width: 24.9%;
  }
  .nav-tabs .nav-link.active{
    background-color: #e6e6e6;
  }
  a.nav-link
  {
    min-width: 25%;
    cursor: pointer;
  }
  .logo{
    width: 50px;
  }

</style>