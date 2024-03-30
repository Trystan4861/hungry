<template>
  <div id="SlotFullScreen">
    <div>
      <div class="text-center mb-1">Pestaña activa por defecto</div>
      <my-select 
          :options="props.tabs.filter(item=>item.selectable)" 
          :selected="props.tabs[selected]" 
          @select="handleTabSelected" 
        />
    </div>
  </div>
</template>

<script setup>
  import MySelect from '@/components/MySelect.vue'
  import { defineProps,defineEmits } from 'vue';

    const props=defineProps({ 
      tabs:     { type: Array,  required: true }, 
      selected: { type: Number, required: true },
    })
    const handleTabSelected = tabSelected => emit('change',tabSelected.id)
    const emit=defineEmits(['change'])
</script>
<style scoped>

</style>