<template>
  <div class="my-button">
    <button :class="['btn', `btn-${props.btnClass}`]" @click="click" :style="styleOfButton"><span class="btn-text">{{ props.text }}</span></button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  text: { type: String, required: true },
  btnClass: { type: String, default: "success" },
  styleButton: { type: Object, default: () => ({ borderRadius: "0.375rem" }) },
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

