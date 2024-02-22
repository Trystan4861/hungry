<template>
  <div class="my-tab" ref="tabsContainerRef">
    <ul class="nav nav-tabs">
      <!-- Mostramos cada pestaña en la cabecera -->
      <li class="nav-item" :class="{ active: this.activeTab === index }" v-for="(tab, index) in tabs" :key="index" :style="tabStyle">
        <a
          class="nav-link"
          :class="{ active: this.activeTab === index }"
          @click="activateTab(index)">
          <MyImageLoader :image="tab.logo?tab.logo:emptyIMG" :className="'logo'" /> {{ tab.title }}
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
import MyImageLoader from './MyImageLoader.vue';
import {ref, watch, onMounted, onBeforeUnmount} from 'vue';

export default {
  name: 'MyTab',
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    defaultActive:{
      type: Number,
      default:0
    }
  },
  data() {
    return {
      emptyIMG:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII="
    };
  },
  setup(props,{emit}){
      const tabsContainerRef = ref(null);
      const activeTab = ref(props.defaultActive)
      watch(() => props.defaultActive, (newValue) => {
        activeTab.value = newValue;
      });
      const tabStyle = ref({});
      const updateTabStyle = () => {
        const container = tabsContainerRef.value;
        if (!container) return;
        const containerWidth = container.clientWidth;
        const widthStyle = (((containerWidth-60) / 4)-1);
        tabStyle.value = {width: `${widthStyle}px`};
        emit('tabHeightChanged',container.clientHeight)
      };
      onMounted(()=>{
        window.addEventListener('resize', updateTabStyle);
        updateTabStyle();
        })
      onBeforeUnmount(() => {
        window.removeEventListener('resize', updateTabStyle);
      });
      return {
        tabStyle,
        tabsContainerRef,
        activeTab
      }
  },
  methods: {
    activateTab(index) {
      this.activeTab = index;
      this.$emit('tabChanged', index);
    },
  },
  emits: ['tabChanged','tabHeightChanged'], // Declarar el evento tabChanged para evitar la advertencia
  components:{
    MyImageLoader
  }
};
</script>
  
<style scoped>
  .my-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .tab-content {
    flex-grow: 1; /* Esto permite que el contenido de la pestaña se expanda para ocupar el espacio restante */
    display: flex;
    flex-direction: column;
  }
  .tab-pane {
    flex-grow: 1;
    overflow-y: auto; /* Permite el desplazamiento si el contenido excede el alto disponible */
  }
  li.nav-item:first-child {
    max-width: 3.75rem;
  }
  .nav-tabs{
    --bs-nav-tabs-border-color: black;
    justify-content: space-between;
  }
  .nav-tabs .nav-link{
    background-color: #585858;
    color: white;
    display: flex;
    height:100%;
    justify-content: center;
  }
  .nav-tabs .nav-link.active{
    background-color: #e6e6e6;
    color:black;
    border: 0;
  }
  .nav-item:nth-child(2) .nav-link.active img,
  .nav-item:nth-child(5) .nav-link.active img,
  .nav-item:first-child .nav-link.active img{
    filter: grayscale(1) brightness(100) invert(1);
  }
  a.nav-link
  {
    min-width: 25%;
    cursor: pointer;
    padding: 0;
  }
  .logo{
    width: 3.125rem;
  }

</style>