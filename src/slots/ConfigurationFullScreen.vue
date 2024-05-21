<template>
  <div id="SlotFullScreen">
    <div class="text-center text-uppercase">Ejecutar en Pantalla Completa</div>
    <div>
      <my-checkbox
        :label="props.selected? props.labelOK : props.labelKO"
        :selected="props.selected"
        :styled="true"
        @checkedValue="handleCheckedValue"
        value="1"
      />
    </div>
  </div>
</template>

<script setup>
  import MyCheckbox from '@components/MyCheckbox.vue'

  const emit                = defineEmits(['change'])
  const props               = defineProps({ 
    selected: { type: Boolean,  required: true },
    labelOK:  { type: String,   default: "Sí" },
    labelKO:  { type: String,   default: "No" },
  });

  const handleCheckedValue  = (_,checked) => {
    emit('change', checked)
  }
</script>
<style scoped>
</style>