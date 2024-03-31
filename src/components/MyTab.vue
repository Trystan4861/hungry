<template>
  <div class="my-tab" ref="tabsContainerRef">
    <ul class="nav nav-tabs">
      <!-- Mostramos cada pestaña en la cabecera -->
      <li class="nav-item" :class="{ active: activeTab === index }" v-for="(tab, index) in tabs" :key="index" :style="tabStyle">
        <span
          class="nav-link"
          :class="{ active: activeTab === index }"
          @click="activateTab(index)">
          <my-image-loader :image="tab.logo?tab.logo:emptyIMG" :className="'logo'" /> {{ tab.title }}
        </span>
      </li>
    </ul>
    <!-- Mostramos el contenido de la pestaña activa -->
    <div class="tab-content">
      <div class="tab-pane fade show" :class="{ active: activeTab === index }" :id="'tab' + index" v-for="(tab, index) in tabs" :key="index">
          <slot :name="'tabContent' + index"></slot>
      </div>
    </div>
  </div>
</template>
<script setup>
import MyImageLoader from '@/components/MyImageLoader.vue';
import { ref, watch, onMounted, onBeforeUnmount, defineEmits, defineProps } from 'vue';

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  defaultActive: {
    type: Number,
    default: 0
  },
  heightDesviation: {
    type: Number,
    default: 0
  },
  heightResponsive: {
    type: Boolean,
    default: false
  }
});

const emptyIMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=";
const tabsContainerRef = ref(null);
const activeTab = ref(props.defaultActive);
const tabStyle = ref({});

watch(() => props.defaultActive, (newValue) => {
  activeTab.value = newValue;
});

const updateTabStyle = () => {
  const container = tabsContainerRef.value;
  if (!container) return;
  const containerWidth = container.clientWidth;
  const widthStyle = (((containerWidth - 60) / 4) - 1);
  tabStyle.value = { width: `${widthStyle}px` };
  if (props.heightResponsive)
    emit('tabHeightChanged', container.clientHeight + props.heightDesviation);
};

onMounted(() => {
  window.addEventListener('resize', updateTabStyle, { passive: true });
  setTimeout(updateTabStyle,500);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateTabStyle);
});

const activateTab = (index) => {
  activeTab.value = index;
  emit('tabChanged', index);
};

const emit = defineEmits(['tabChanged', 'tabHeightChanged']);

</script>

  
<style scoped>
  .my-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    user-select: none;
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
  span.nav-link
  {
    min-width: 25%;
    cursor: pointer;
    padding: 0;
  }
  .logo{
    width: 3.125rem;
  }

</style>