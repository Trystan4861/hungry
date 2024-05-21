<template>
  <div class="my-button">
    <button v-if="props.btnClass!='none'" :class="['btn', `btn-${props.btnClass}`,{ 'text-uppercase': props.uppercase }]" @click="emit('click')" :style="props.styleButton"><span class="btn-text mx-1"><slot>{{ props.text }}</slot></span></button>
    <div v-else><span class="btn-text mx-1" :class="['cursor-pointer',{ 'text-uppercase': props.uppercase }]" @click="emit('click')"><slot>{{ props.text }}</slot></span></div>
  </div>
</template>

<script setup>
const props = defineProps({
  text:         { type: String,   default: "text_button" },
  btnClass:     { type: String,   default: "success" },
  styleButton:  { type: Object,   default: () => ({ borderRadius: "0.375rem" }) },
  uppercase:    {type:  Boolean,  default: true},
});
const emit = defineEmits(['click']);
</script>

<style scoped>
  button {
    height:   3.125rem;
    padding:  0;
    width:    100%;
  }
</style>

