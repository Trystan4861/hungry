<template>
  <div class="modal" v-show="visible" :style="{ display: visible ? 'block' : 'none' }">
    <div class="modal-content">
      <div class="d-flex cabecera-modal">
        <span class="close" @click="closeModal">&times;</span>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyModalSlot',
  data() {
    return {
      visible: false
    };
  },
  methods: {
    openModal() {
      this.visible = true;
    },
    closeModal() {
      this.visible = false;
    },
  },
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
  display:flex;
  justify-content: center;
  align-items: center;
}
.cabecera-modal{
  justify-content: end;
}
.modal-content {
  background-color: #7e7d7d;
  margin: 15% auto;
  padding: 1.25rem;
  border: .0625rem solid #888;
  width: 80%;
  max-width: 600px;
}

.close {
  position: relative;
  top: -1.25rem;
  right:-0.3125rem;
  color: #aaa;
  float: right;
  font-size: 1.75rem;
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