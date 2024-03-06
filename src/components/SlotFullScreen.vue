<template>
  <div id="SlotFullScreen">
    <div class="categoriesContainer">
      <MyCheckbox
        value="1"
        :label="'Ejecutar en Pantalla Completa'"
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
  import MyCheckbox from './MyCheckbox.vue'
  export default {
    name:                  'SlotFullScreen',
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