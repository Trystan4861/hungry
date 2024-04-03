<template>
  <div id="SlotFullScreen">
    <div class="text-center">Ejecutar en Pantalla Completa</div>
    <div>
      <my-checkbox
        value="1"
        :label="props.selected?'Sí':'No'"
        :selected="props.selected"
        :styled="true"
        @update:checkedValue="handleCheckedValue"
      />
    </div>
  </div>
</template>

<script setup>
  import MyCheckbox from '@components/MyCheckbox.vue'
  import { defineProps,defineEmits } from 'vue';

  const props               = defineProps(
    { selected: { type: Boolean, required: true } },
  );
  const handleCheckedValue  = (_,checked) => emit('change', checked)
  const emit                = defineEmits(['change'])
</script>
<style scoped>
</style>