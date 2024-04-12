<template>
  <div id="SlotFullScreen">
    <div>
      <div class="text-center mb-1 text-uppercase">Pestaña activa por defecto</div>
      <my-select 
          :options="props.tabs.filter(item=>item.selectable)" 
          :selected="props.tabs[selected]" 
          :emitOnMount="false"
          @select="handleSelect" 
        />
    </div>
  </div>
</template>

<script setup>
  import MySelect from '@components/MySelect.vue'

    const props=defineProps({ 
      tabs:     { type: Array,  required: true }, 
      selected: { type: Number, required: true },
    })

    const handleSelect = selected => emit('change',selected.id)
    const emit=defineEmits(['change'])
    

</script>
<style scoped>
</style>