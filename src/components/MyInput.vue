<template>
  <div class="input-container">
    <input ref="myInput" type="text" :id="inputID" v-model="inputValue" :placeholder="placeholder">
  </div>
</template>

<script>
export default {
  name: 'MyInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Añade elementos aquí'
    },
    autofocus:{
      type: Boolean,
      default:false
    }
  },
  data() {
    return {
      inputValue: this.modelValue,
      inputID: `input-${Math.random().toString(36).slice(2)}`,
    }
  },
  watch: {
    modelValue(newValue) {
      // Actualizar el inputValue cuando cambia el valor desde app.vue
      this.inputValue = newValue;
    },
    inputValue(newValue) {
      // Emitir evento cuando cambia el valor del input
      this.$emit('update:modelValue', newValue);
    }
  },
  methods:{
    focusInput() {
      if (!this.autofocus) return;
      this.$refs.myInput.focus();
    }
  },
  emits: ['update:modelValue'],
  mounted() {
    // Llama a la función para enfocar el input después de que el componente se monte
      setTimeout(this.focusInput,500);
  }
};
</script>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
}

input {
  width: 100%;
  height: 3.125rem;
  border: .125rem solid sandybrown;
}
input:focus-visible { outline: 0; }

</style>
