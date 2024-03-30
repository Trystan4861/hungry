<template>
  <div class="my-button">
    <button :class="['btn', `btn-${props.btnClass}`]" @click="click"><span class="btn-text">{{ props.text }}</span></button>
  </div>
</template>

<script setup>
  import { defineProps,defineEmits } from 'vue';

  const props = defineProps({
    text:     { type: String, required: true      },
    btnClass: { type: String, default: "success"  },
  });
  const emit=defineEmits(['click']);
  const click = () => emit('click');
</script>

<style scoped>
  button {
    height:   3.125rem;
    padding:  0;
    width:    100%;
  }
</style>
