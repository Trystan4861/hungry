<template>
  <div id="SlotFullScreen">
    <div>
      <my-select>
    </div>
  </div>
</template>

<script>
  import MySelect from './MySelect.vue'
  export default {
    name:                  'SlotFullScreen',
    props:                 { tabs: { type: Array, required: true } },
    components:            { MySelect,                             },
    setup(props, { emit }) {
      const    handleCheckedValue   = (_,checked) => emit('change', checked)
      return { handleCheckedValue }
    },
    emits: ['change']
  }
</script>
<style scoped>
</style>