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
import { ref, watch, onMounted, onBeforeUnmount, defineEmits, defineProps } from 'vue';

const props = defineProps({
  tabs:             { type: Array,    required: true, },
  defaultActive:    { type: Number,   default:  0     },
  heightDesviation: { type: Number,   default:  0     },
  heightResponsive: { type: Boolean,  default:  false },
});

const emptyIMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=";
const tabsContainerRef = ref(null);
const activeTab = ref(props.defaultActive);
const tabStyle = ref({});

watch(() => props.defaultActive, (newValue) => activeTab.value = newValue);

const updateTabStyle = () => {
  const container = tabsContainerRef.value;
  if (!container) return;
  tabStyle.value = { width: `${(((container.clientWidth - 60) / 4) - 1)}px` };
  (props.heightResponsive)?emit('tabHeightChanged', container.clientHeight + props.heightDesviation):null;
};

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

</script>

  
<style scoped src="@css/MyTab.vue.css" />