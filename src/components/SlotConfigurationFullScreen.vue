<template>
  <div id="SlotFullScreen">
    <div class="text-center">Ejecutar en Pantalla Completa</div>
    <div>
      <my-checkbox
        value="1"
        :label="selected?'Sí':'No'"
        :selected="selected"
        :styled="true"
        :dotDiameter="'1rem'"
        :checkedColor="'#6c757d'"
        :uncheckedColor="'#333'"
        :checkmarkColor="'white'"
        :crossColor="'white'"
        @update:checkedValue="handleCheckedValue"
      />
    </div>
  </div>
</template>

<script>
  import MyCheckbox from '@components/MyCheckbox.vue'
  export default {
    name:                  'SlotConfigurationFullScreen',
    props:                 { selected: { type: Boolean, required: true } },
    components:            { MyCheckbox,                                 },
    setup(props, { emit }) {
      const    handleCheckedValue   = (_,checked) => emit('change', checked)
      return { handleCheckedValue }
    },
    emits: ['change']
  }
</script>
<style scoped>
</style>