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

  import { findIndexById } from '@/utilidades';

  export default {
    name:                   'SlotConfigurationTabsActive',
    props:                  { tabs:     { type: Array,  required: true }, 
                              selected: { type: Number, required: true },
                            },
    components:             { 
                              MySelect,
                            },
    setup (props, { emit }) { 
      const handleTabSelected   = tabSelected => emit('change',findIndexById(tabSelected.id,props.tabs))
      return { handleTabSelected }
    },
    emits: ['change']
  }
</script>
<style scoped>

</style>