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

<script setup>
import { ref } from 'vue';

const visible     = ref(false);
/* eslint-disable-next-line */
const openModal   = () => {visible.value = true };
const closeModal  = () => {visible.value = false};
</script>


<style scoped>
/* Estilos para la ventana modal */
.modal {
  align-items:        center;
  background-color: rgba(0, 0, 0, 0.5);
  display:            flex;
  height:             100%;
  justify-content:    center;
  left:               0;
  overflow:           auto;
  position:           fixed;
  top:                0;
  width:              100%;
  z-index:            1000;
}
.cabecera-modal {
  justify-content:    end;
}
.modal-content {
  background-color: #7e7d7d;
  border:             .0625rem solid #888;
  margin:             15% auto;
  max-width:          600px;
  padding:            1.25rem;
  width:              80%;
}

.close {
  color:            #aaa;
  float:              right;
  font-size:          1.75rem;
  font-weight:        bold;
  position:           relative;
  right:              -0.3125rem;
  top:                -1.25rem;
}

.close:hover,
.close:focus {
  color:            black;
  cursor:             pointer;
  text-decoration:    none;
}
input {
  background-color: lightgray;
  color:            black;
}
</style>