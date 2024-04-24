<template>
  <div class="my-button">
    <button v-if="props.btnClass!='none'" :class="['btn', `btn-${props.btnClass}`,{ 'text-uppercase': props.uppercase }]" @click="click" :style="styleOfButton"><span class="btn-text mx-1"><slot>{{ props.text }}</slot></span></button>
    <div v-else><span class="btn-text mx-1" :class="['cursor-pointer',{ 'text-uppercase': props.uppercase }]" @click="click"><slot>{{ props.text }}</slot></span></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  text: { type: String, default: "text_button" },
  btnClass: { type: String, default: "success" },
  styleButton: { type: Object, default: () => ({ borderRadius: "0.375rem" }) },
  uppercase: {type: Boolean, default:true},
});
const styleOfButton = ref(props.styleButton);
watch(() => props.styleButton, (newData) => styleOfButton.value = newData);
const emit = defineEmits(['click']);
const click = () => emit('click');
</script>

<style scoped>
  button {
    height:   3.125rem;
    padding:  0;
    width:    100%;
  }
</style>

