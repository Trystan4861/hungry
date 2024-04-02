<template>
  <div class="input-container">
    <input ref="inputRef" type="text" :id="inputID" v-model="inputValue" @keydown="handleKeyDown" @keyup="hadleKeyUp" :placeholder="placeholder" :maxlength="maxLength">
  </div>
</template>

<script setup>
  import { ref, watch, onMounted,defineProps,defineEmits,defineExpose } from 'vue';
  const props         = defineProps({
    modelValue:   { type: String,   default: ''                     },
    placeholder:  { type: String,   default: 'Añade elementos aquí' },
    autofocus:    { type: Boolean,  default: false                  },
    maxLength:    { type: Number,   default: Infinity               },
  });

  const emit = defineEmits(['update:modelValue','keyPressed:enter']);
  
  const inputValue    = ref(props.modelValue);
  const inputID       = `input-${Math.random().toString(36).slice(2)}`;
  const inputRef      = ref(null);

  const ignoreKeys    = ['Enter','Backspace','Delete']
  const focusInput    = () => (props.autofocus)?inputRef.value.focus():null;
  const handleKeyDown = event => props.maxLength !== Infinity && inputValue.value.length >= props.maxLength && !ignoreKeys.includes(event.key) ? event.preventDefault() :null;
  const hadleKeyUp    = event => event.key === 'Enter' && emit('keyPressed:enter')

  watch (() => props.modelValue,  newValue => inputValue.value = newValue);
  watch (inputValue,              newValue => emit('update:modelValue', newValue));

  onMounted (() => setTimeout(() =>(props.autofocus)?focusInput():null, 1000));

  defineExpose({inputValue})
</script>

<style scoped>
  @import url('@css/MyInput.vue.css');
</style>
