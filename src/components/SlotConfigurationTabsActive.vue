<template>
  <div id="SlotFullScreen">
    <div>
      <div class="text-center mb-1">Pestaña activa por defecto</div>
      <my-select :options="tabs" :selected="tabs[selected]" @select="handleTabSelected" />
    </div>
  </div>
</template>

<script>
  import MySelect from '@components/MySelect.vue'
  import { useStore } from 'vuex';
  import { computed } from 'vue';
  export default {
    name:                   'SlotConfigurationTabsActive',
    props:                  { tabs: { type: Array, required: true } },
    components:             { MySelect,                             },
    setup (props, { emit }) { 
      const selected            = computed(() => useStore().getters.getDefaultTabActive())
      const handleTabSelected   = tabSelected => emit('change',tabSelected)
      return { selected,handleTabSelected }
    },
    emits: ['change']
  }
</script>
<style scoped>

</style>