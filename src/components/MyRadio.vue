<template>
  <label class="my-radio">
    <input type="radio" :value="id" :checked="id === selected" @change="handleChange">
    <img :src="image" alt="Radio Option">
  </label>
</template>

<script>
export default {
  props: {
    id: { type: String, required: true },
    image: { type: String, required: true },
    selected: { type: String, required: true }
  },
  methods: {
    handleChange(event) { this.$emit('update:selected', event.target.value); }
  }
};
</script>

<style scoped>
  .my-radio { display: inline-block; margin-right: 10px; }
</style>
