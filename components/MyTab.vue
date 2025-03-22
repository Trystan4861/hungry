<template>
    <div class="my-tab" ref="tabsContainerRef">
      <ul class="nav nav-tabs">
        <li
          class="nav-item"
          :class="{ active: activeTab === index }"
          v-for="(tab, index) in tabs"
          :key="tab.id"
          :style="tabStyle"
        >
          <span
            class="nav-link"
            :class="{ active: activeTab === index }"
            @click="activateTab(index)"
          >
            <MyImage :image="tab.logo ? tab.logo : emptyIMG" className="logo" />
            {{ tab.title }}
          </span>
        </li>
      </ul>
      <div class="tab-content">
        <div
          class="tab-pane fade show"
          :class="{ active: activeTab === index }"
          :id="'tab' + index"
          v-for="(tab, index) in tabs"
          :key="index"
        >
          <slot :name="'tabContent' + index"></slot>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import MyImage from '~/components/MyImage.vue';
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

  const props = defineProps({
    tabs: { type: Array, required: true },
    defaultActive: { type: Number, default: -1 },
    heightResponsive: { type: Boolean, default: true },
  });

  const emptyIMG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';

  // Usamos useState para crear el estado global
  const activeTab = useState('activeTab', () => props.defaultActive);
  const heightDesviation = useState('heightDesviation', () => 0);

  const tabsContainerRef = ref(null);
  const tabStyle = ref({});

  const updateTabStyle = () => {
    const container = tabsContainerRef.value;
    if (!container) return null;
    tabStyle.value = { width: `${(container.clientWidth - 60) / 4 - 1}px` };
    props.heightResponsive && getAvailHeight();
  };

  const getAvailHeight = () => {
    heightDesviation.value = tabsContainerRef.value ? tabsContainerRef.value.clientHeight : 0;
  };

  onMounted(() => {
    window.addEventListener('resize', updateTabStyle, { passive: true });
    setTimeout(updateTabStyle, 50);
    emit('tabChanged', activeTab.value);
  });

  onBeforeUnmount(() => window.removeEventListener('resize', updateTabStyle));

  const activateTab = (index) => {
    activeTab.value = index; // Actualizamos el estado global
    emit('tabChanged', index);
  };

  const emit = defineEmits(['tabChanged']);
  </script>

  <style scoped>
  .my-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    user-select: none;
  }
  .tab-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 18.125rem;
  }
  .tab-pane {
    flex-grow: 1;
    overflow-y: auto;
  }
  li.nav-item:first-child {
    max-width: 3.75rem;
  }
  .nav-tabs {
    --bs-nav-tabs-border-color: #585858;
    justify-content: space-between;
    height: 3.125rem;
  }
  .nav-tabs .nav-link {
    background-color: #585858;
    color: white;
    display: flex;
    height: 100%;
    justify-content: center;
    min-width: 3.4375rem;
  }
  .nav-tabs .nav-link.active {
    background-color: #e6e6e6;
    color: black;
    border: 0;
  }
  .nav-item:nth-child(2) .nav-link.active .MyImage,
  .nav-item:nth-child(5) .nav-link.active .MyImage,
  .nav-item:first-child .nav-link.active .MyImage {
    filter: grayscale(1) brightness(100) invert(1);
  }
  .nav-item .nav-link .MyImage {
    margin: 0 !important;
  }
  span.nav-link {
    min-width: 25%;
    width: 100%;
    cursor: pointer;
    padding: 0;
  }
  .logo {
    width: 3.125rem;
  }
  </style>
