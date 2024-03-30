<template>
  <div class="modal" v-show="visible" :style="{ display: visible ? 'block' : 'none' }">
    <div class="modal-content">
      <div class="d-flex cabecera-modal">
        <h2>{{ title }}</h2>
        <span class="close" @click="closeModal">&times;</span>
      </div>
      <p>{{ message }}</p>
      <input type="text" ref="inputText" name="inputText" id="inputText" v-model="inputText" @keydown.enter="handleEnterKey">
      <button @click="handleButtonClick">Guardar cambios</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props             = defineProps({
  title:    { type: String, default: 'Titulo'   },
  message:  { type: String, default: 'Mensaje'  },
  value:    { type: String, default: ''         }
});

const inputText         = ref(props.value);
const visible           = ref(false);

/* eslint-disable */
const openModal         = () => setTimeout(() => (visible.value = true, inputFocus()), 50);
/*eslint-enable */
const emit              = defineEmits(['inputModalChange']);
const inputFocus        = () => inputText.value.focus();
const closeModal        = () => visible.value = false;
const handleButtonClick = () => (emit('inputModalChange', inputText.value),closeModal())
const handleEnterKey    = event => (event.key === 'Enter')?handleButtonClick():null;

watch(() => props.value, newValue => inputText.value = newValue);
</script>

<style scoped>
/* Estilos para la ventana modal */
.modal {
  position:           fixed;
  z-index:            1000;
  left:               0;
  top:                0;
  width:              100%;
  height:             100%;
  overflow:           auto;
  background-color: rgba(0, 0, 0, 0.5);
  display:            flex;
  justify-content:    center;
  align-items:        center;
}
.cabecera-modal{
  justify-content:    space-between;
}
.modal-content {
  background-color: #7e7d7d;
  margin:             15% auto;
  padding:            1.25rem;
  border:             .0625rem solid #888;
  width:              80%;
  max-width:          600px;
}

.close {
  position:           relative;
  top:                -1.25rem;
  right:              -0.3125rem;
  color:            #aaa;
  float:              right;
  font-size:          1.75rem;
  font-weight:        bold;
}

.close:hover,
.close:focus {
  color:            black;
  text-decoration:    none;
  cursor:             pointer;
}
input
{
  color: black;
  background-color: lightgray;
}
</style>