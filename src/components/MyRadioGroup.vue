<template>
  <div>
    <my-radio v-for="radio in radios" :key="radio.id" :id="radio.id" :image="radio.image" :selected="selectedRadio" />
  </div>
</template>

<script>
import MyRadio from './MyRadio.vue';

export default {
  name:"MyRadioGroup",
  components: {
    MyRadio
  },
  props: {
    radios: {
      type: Array,
      required: true
    },
    selectedRadio: {
      type: String // Debe ser una variable de datos que esté vinculada al valor seleccionado
    }
  }
};
</script>
