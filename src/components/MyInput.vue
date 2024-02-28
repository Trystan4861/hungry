<template>
  <div class="input-container">
    <input ref="myInput" type="text" :id="inputID" v-model="inputValue" @keydown="handleKeyDown" :placeholder="placeholder" :maxlength="maxLength">
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
    autofocus: {
      type: Boolean,
      default: false
    },
    maxLength: {
      type: Number,
      default: Infinity
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
  methods: {
    focusInput() {
      if (!this.autofocus) return;
      this.$refs.myInput.focus();
    },
    handleKeyDown(event) {
      if (
        this.maxLength !== Infinity &&
        this.inputValue.length >= this.maxLength &&
        event.key !== 'Enter' &&
        event.key !== 'Backspace' && // Permitir eliminar caracteres con la tecla de retroceso
        event.key !== 'Delete' // Permitir eliminar caracteres con la tecla de suprimir
      ) {
        event.preventDefault(); // Evitar que se introduzcan más caracteres si se alcanza el límite
      }
      if (event.key === 'Enter') {
        this.$emit('keyPressed:enter'); // Emitir evento cuando se presiona la tecla "Enter"
      }
    }
  },
  mounted() {
    // Llama a la función para enfocar el input después de que el componente se monte
    setTimeout(() => {
      if (this.autofocus) {
        this.focusInput();
      }
    }, 1000);
  },
  emits: ['update:modelValue', 'keyPressed:enter']
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
