<template>
  <div class="my-button">
    <button :class="['btn', `btn-${btnClass}`]" @click="submit"><span class="btn-text">{{ text }}</span></button>
  </div>
</template>

<script>
  export default {
    name: 'MyButton',
    props: { 
      text: { type: String, required: true },
      btnClass:{ type:String, default: "success"}
    },
    methods: { submit() { this.$emit('click'); } },
    emits: ['click']
  }
</script>

<style scoped>
  button{
    width: 100%;
    height: 3.125rem;
    padding: 0;
  }
</style>
