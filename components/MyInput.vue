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
      @blur="handleBlur">
    <span class="cross" @click="handleCrossClick" v-show="showCross || showEmpty">{{ (showCross && showEmpty)?(inputValue!=''?crossEmptyText:crossCloseText):(showCross?crossCloseText:crossEmptyText) }}</span>
  </div>
</template>
<!-- ✖ ❌ ✖️ -->
<script lang="ts" setup>
  import { ref, watch, onMounted } from 'vue';
  import { generateID } from '~/utils';
  const props         = defineProps({
    modelValue:       { type: String,   default: ''                     },
    placeholder:      { type: String,   default: 'Añade elementos aquí' },
    autoFocus:        { type: Boolean,  default: false                  },
    maxLength:        { type: Number,   default: Infinity               },
    defaultMaxLength: { type: Boolean,  default: false                  },
    showCross:        { type: Boolean,  default: false                  },
    showEmpty:        { type: Boolean,  default: false                  },
    class:            { type: String,                                   },
    style:            { type: String,                                   },
    crossEmptyText:   { type: String,   default: '🗑'                   },
    crossCloseText:   { type: String,   default: '❌'                   },
    id:               { type: String,   default: null                   }

  });

  const store = myStore();
  const inputValue    = ref(props.modelValue);
  const id            = generateID()
  const inputID       = props.id??`input-${id}`;
  const inputRef      = ref<HTMLInputElement | null>(null);

  const realMaxLenght = ref(props.maxLength)

  if (props.defaultMaxLength) realMaxLenght.value= store.maxLenght.value




  const ignoreKeys        = ['Enter','Backspace','Delete']
  const focusInput        = () => {
    if (props.autoFocus && inputRef.value) {
      inputRef.value.focus();
    }
  };
  const handleKeyDown     = (event: KeyboardEvent) => realMaxLenght.value !== Infinity && inputValue.value.length >= realMaxLenght.value && !ignoreKeys.includes(event.key) ? event.preventDefault() :null;
  const hadleKeyUp        = (event: KeyboardEvent) => event.key === 'Enter' && emit('keyPressed:enter')
  const handleBlur        = (event: Event) => emit('blur',event)
  const handleCrossClick  = () => {
    if (inputValue.value!='' && props.showEmpty)
    {
      inputValue.value=''
      focusInput()
    }
    else
      emit('crossClick')
  }

  watch (() => props.modelValue,  newValue => inputValue.value = newValue);
  watch (inputValue,              newValue => emit('updateValue', newValue));

  onMounted (() => setTimeout(() => focusInput(), 100));

  const emit = defineEmits(['updateValue','keyPressed:enter','blur','click','crossClick']);
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
    left:           -23px;
    position:       relative;
    cursor:         pointer;
  }
</style>
