<template>
  <div class="my-tab" ref="tabsContainerRef">
    <ul class="nav nav-tabs">
      <!-- Mostramos cada pestaña en la cabecera -->
      <li class="nav-item" :class="{ active: activeTab === index }" v-for="(tab, index) in tabs" :key="index" :style="tabStyle">
        <span
          class="nav-link"
          :class="{ active: activeTab === index }"
          @click="activateTab(index)">
          <MyImage :image="tab.logo?tab.logo:emptyIMG" :className="'logo'" /> {{ tab.title }}
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
import MyImage from '@components/MyImage.vue';
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { useStore } from 'vuex';
import { localStorageService } from '@/localStorageService';
import { getDataFromLocalStorage } from '@/utilidades'


const props = defineProps({
  tabs:             { type: Array,    required: true, },
  defaultActive:    { type: Number,   default:  -1    },
  heightDesviation: { type: Number,   default:  0     },
  heightResponsive: { type: Boolean,  default:  true },
});

const store=useStore()
const storeGet=store.getters
const emptyIMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=";
const tabsContainerRef = ref(null);
const activeTab = ref(props.defaultActive);

/*const initialData             = storeGet.getConfiguration()
const getDataFromLocalStorage = index=> {
          let storedData = localStorageService.getSubItem(index);
          if (storedData) if (index != 'configuracion' ) store.dispatch(`set${index.replace(/\b\w/g,c=>c.toUpperCase())}`, storedData);
          return storedData ?? localStorageService.setSubItem(index, initialData[index]);
      }*/
if (props.defaultActive==-1)
  activeTab.value=getDataFromLocalStorage(store,'defaultTabActive')

const tabStyle = ref({});

const heightDesviation  = computed(()=>storeGet.getHeightDesviation())

watch(() => props.defaultActive, (newValue) => activeTab.value = newValue);

const updateTabStyle = () => {
  const container = tabsContainerRef.value;
  if (!container) return null;
  tabStyle.value = { width: `${(((container.clientWidth - 60) / 4) - 1)}px` };
  (props.heightResponsive)?getAvailHeight():null;
};

const getAvailHeight =()=>{
  store.dispatch('setAlturaDisponible',localStorageService.setSubItem('alturaDisponible',  tabsContainerRef.value?tabsContainerRef.value.clientHeight + heightDesviation.value:0))
}
onMounted(() => {
  window.addEventListener('resize', updateTabStyle, { passive: true });
  setTimeout(updateTabStyle,50);
  emit('tabChanged', props.defaultActive);
});

onBeforeUnmount(() => window.removeEventListener('resize', updateTabStyle));

const activateTab = (index) => {
  activeTab.value = index;
  emit('tabChanged', index);
};


const emit = defineEmits(['tabChanged', 'tabHeightChanged']);

defineExpose({getAvailHeight})
</script>

  
<style scoped>
.my-tab {
  display:                      flex;
  flex-direction:               column;
  height:                       100%;
  user-select:                  none;
}
.tab-content {
  flex-grow:                    1;
  display:                      flex;
  flex-direction:               column;
  min-width:                    18.125rem;
}
.tab-pane {
  flex-grow:                    1;
  overflow-y:                   auto; 
}
li.nav-item:first-child {
  max-width:                    3.75rem;
}
.nav-tabs{
  --bs-nav-tabs-border-color: #585858;
  justify-content:              space-between;
}
.nav-tabs .nav-link{
  background-color:           #585858;
  color:                      white;
  display:                      flex;
  height:                       100%;
  justify-content:              center;
  min-width:                    3.4375rem;
}
.nav-tabs .nav-link.active{
  background-color:           #e6e6e6;
  color:                      black;
  border:                       0;
}
.nav-item:nth-child(2) .nav-link.active .MyImage,
.nav-item:nth-child(5) .nav-link.active .MyImage,
.nav-item:first-child .nav-link.active .MyImage{
  filter:                       grayscale(1) brightness(100) invert(1);
}
.nav-item .nav-link .MyImage{
  margin:                       0! important;
}
span.nav-link
{
  min-width:                    25%;
  width:                        100%;
  cursor:                       pointer;
  padding:                      0;
}
.logo{
  width:                        3.125rem;
}
</style>