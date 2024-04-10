<template>
  <label class="my-radio">
    <input type="radio" :value="id" :checked="checked" @change="handleChange">
    <img :src="image" alt="Radio Option">
  </label>
</template>

<script setup>
import { computed } from 'vue';

const props         = defineProps({
  id:       { type: String, required: true },
  image:    { type: String, required: true },
  selected: { type: String, required: true }
});

const checked       = computed(()=>props.id === props.selected)
const handleChange  = event => emit('update:selected', event.target.value)
const emit          = defineEmits(['update:selected']);
</script>


<style scoped>
.my-radio { 
  display:      inline-block; 
  margin-right: 10px; 
}
</style>
