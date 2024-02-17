<template>
  <div class="modal" v-show="visible" :style="{ display: visible ? 'block' : 'none' }">
    <div class="modal-content">
      <div class="d-flex cabecera-modal">
        <h2>{{ title }}</h2>
        <span class="close" @click="closeModal">&times;</span>
      </div>
      <p>{{ message }}</p>
      <input type="text" name="inputText" id="inputText" v-model="inputText" @keydown.enter="handleEnterKey">
      <button @click="handleButtonClick">Guardar cambios</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyModal',
  props: {
    title: {
      type: String,
      default: 'Modal Title'
    },
    message: {
      type: String,
      default: 'Modal Message'
    },
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputText: this.value,
      visible: false
    };
  },
  watch: {
    value(newValue) {
      this.inputText = newValue;
    }
  },
  methods: {
    openModal() {
      this.visible = true;
    },
    closeModal() {
      this.visible = false;
    },
    handleButtonClick() {
      this.$emit('inputModalChange', this.inputText);
      this.closeModal();
    },
    handleEnterKey(event) {
      if (event.key === 'Enter') {
        this.handleButtonClick();
      }
    }
  },
  emits: ['inputModalChange']
};
</script>

<style scoped>
/* Estilos para la ventana modal */
.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
}
.cabecera-modal{
  justify-content: space-between;
}
.modal-content {
  background-color: #7e7d7d;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 600px;
}

.close {
  position: relative;
  top: -20px;
  right:-5px;
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
input
{
  color: black;
  background-color: lightgray;
}
</style>