<template>
  <div class="d-inline-flex w-100">
    <input 
      type="text" 
      v-model="inputValue" 
      :style="props.style" ref="inputRef" 
      :class="props.class" 
      :id="inputID" 
      :placeholder="placeholder" 
      :maxlength="realMaxLenght"

      @keydown="handleKeyDown" 
      @keyup="hadleKeyUp" 
      @blur="handleBlur" 
    >
    <span class="cross" @click="handleCrossClick" v-show="showCross || showEmpty">{{ (showCross && showEmpty)?(inputValue!=''?crossEmptyText:crossCloseText):(showCross?crossCloseText:crossEmptyText) }}</span>
  </div>
</template>
<!-- ✖ ❌ -->
<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useStore } from 'vuex';
  const props         = defineProps({
    modelValue:       { type: String,   default: ''                     },
    placeholder:      { type: String,   default: 'Añade elementos aquí' },
    autofocus:        { type: Boolean,  default: false                  },
    maxLength:        { type: Number,   default: Infinity               },
    defaultMaxLength: { type: Boolean,  default: false                  },
    showCross:        { type: Boolean,  default: false                  },
    showEmpty:        { type: Boolean,  default: false                  },
    class:            { type: String,                                   },
    style:            { type: String,                                   },
    crossEmptyText:   { type: String,   default: '🗑'                   },
    crossCloseText:   { type: String,   default: '✖'                    },

  });

  const store         = useStore();
  const storeGet      = store.getters;
  const inputValue    = ref(props.modelValue);
  const inputID       = `input-${Math.random().toString(36).slice(2)}`;
  const inputRef      = ref(null);
  
  const realMaxLenght = ref(props.maxLength)

  if (props.defaultMaxLength) realMaxLenght.value= storeGet.getMaxLenght()




  const ignoreKeys        = ['Enter','Backspace','Delete']
  const focusInput        = () => (props.autofocus)?inputRef.value?.focus():null;
  const handleKeyDown     = event => realMaxLenght.value !== Infinity && inputValue.value.length >= realMaxLenght.value && !ignoreKeys.includes(event.key) ? event.preventDefault() :null;
  const hadleKeyUp        = event => event.key === 'Enter' && emit('keyPressed:enter')
  const handleBlur        = event => emit('blur',event)
  const handleCrossClick  = () => (inputValue.value!='' && props.showEmpty)? inputValue.value='':emit('click')

  watch (() => props.modelValue,  newValue => inputValue.value = newValue);
  watch (inputValue,              newValue => emit('update:modelValue', newValue));
  
  onMounted (() => setTimeout(() =>(props.autofocus)?focusInput():null, 1000));
  
  const emit = defineEmits(['update:modelValue','keyPressed:enter','blur','click']);
  defineExpose({inputValue})
</script>

<style scoped>
input {
  width:          100%;
  height:         3.125rem;
  border:         .125rem solid sandybrown;
}
input:focus-visible { 
  outline:        0; 
}
.cross
{
  left: -23px;
  position: relative;
  cursor: pointer;
}
</style>
