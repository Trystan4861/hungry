<template>
  <div class="input-container">
    <input ref="inputRef" type="text" :id="inputID" v-model="inputValue" @blur="handleBlur" @keydown="handleKeyDown" @keyup="hadleKeyUp" :placeholder="placeholder" :maxlength="maxLength">
  </div>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useStore } from 'vuex';
  const props         = defineProps({
    modelValue:       { type: String,   default: ''                     },
    placeholder:      { type: String,   default: 'Añade elementos aquí' },
    autofocus:        { type: Boolean,  default: false                  },
    maxLength:        { type: Number,   default: Infinity               },
    defaultMaxLenght: { type: Boolean,  default: false                  },
  });

  const store         = useStore();
  const storeGet      = store.getters;
  const inputValue    = ref(props.modelValue);
  const inputID       = `input-${Math.random().toString(36).slice(2)}`;
  const inputRef      = ref(null);
  
  const realMaxLenght = ref(props.maxLength)

  if (props.defaultMaxLenght) realMaxLenght.value= storeGet.getMaxLenght()




  const ignoreKeys    = ['Enter','Backspace','Delete']
  const focusInput    = () => (props.autofocus)?inputRef.value.focus():null;
  const handleKeyDown = event => realMaxLenght.value !== Infinity && inputValue.value.length >= realMaxLenght.value && !ignoreKeys.includes(event.key) ? event.preventDefault() :null;
  const hadleKeyUp    = event => event.key === 'Enter' && emit('keyPressed:enter')
  const handleBlur    = event => emit('blur',event)
  
  watch (() => props.modelValue,  newValue => inputValue.value = newValue);
  watch (inputValue,              newValue => emit('update:modelValue', newValue));
  
  onMounted (() => setTimeout(() =>(props.autofocus)?focusInput():null, 1000));
  
  const emit = defineEmits(['update:modelValue','keyPressed:enter','blur']);
  defineExpose({inputValue})
</script>

<style scoped>
.input-container {
  display:        flex;
  flex-direction: column;
}
input {
  width:          100%;
  height:         3.125rem;
  border:         .125rem solid sandybrown;
}
input:focus-visible { 
  outline:        0; 
}
</style>
