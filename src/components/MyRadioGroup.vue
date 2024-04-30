<template>
  <div>
    <MyRadio 
      v-for="radio in props.radios" 
      :key="radio.id" 
      :id="radio.id" 
      :image="radio.image" 
      :selected="props.selectedRadio" 
    />
  </div>
</template>

<script setup>
import MyRadio from '@components/MyRadio.vue';

const props = defineProps({
  radios:         { type: Array,  required: true  },
  selectedRadio:  { type: String, required: true  },
});
</script>
<style scoped>
</style>