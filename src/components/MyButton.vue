<template>
  <div class="my-button">
    <button class="btn btn-success" @click="submit">{{ text }}</button>
  </div>
</template>

<script>
export default {
  name: 'MyButton',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  methods: {
    submit() {
      this.$emit('click');
    }
  },
  emits: ['click']

}
</script>

<style>
  button
  {
    width: 100%;
    height: 3.125rem;
  }
</style>
