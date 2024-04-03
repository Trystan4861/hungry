<template>
  <div class="my-select"  @blur="closeDropdown">
    <div @click="toggleDropdown" class="selected-option" tabindex="0" :class="[(toFilter.includes(selectedOption.logo) ? 'white' : ''), showDropdown ? 'show' : '']">
      <MyImage :image="selectedOption.logo" />
      {{ selectedOption.text ? selectedOption.text : placeholder }}
    </div>
    <div class="dropdown" :class="{ show: showDropdown }">
      <div v-for="(option, index) in options" :key="index" class="option" :class="toFilter.includes(option.logo)?'filter':''" @mouseup="selectOption(option)">
        <MyImage :id="id" :image="option.logo" :className="'option-logo'" />
        <div class="label">{{ option.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, defineExpose } from 'vue';
import MyImage from '@components/MyImage.vue';

const props = defineProps({
  modelValue:   { type: Object, },
  options:      { type: Array,  required: true                    },
  placeholder:  { type: String, default:  'Seleccione una opción' },
  selected:     { type: Object, default:  () => ({ id: -1, text: null, logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==" }),
  }
});

const id = `'image-${Math.random().toString(36).slice(2)}`;
const showDropdown = ref(false);
const selectedOption = ref(props.selected);
const modelOption= ref(props.modelValue)

const toFilter = ['add.svg', 'cart.svg'];

const toggleDropdown = () => {
  emit('click', !showDropdown.value ? 'hidden' : 'visible');
  showDropdown.value = !showDropdown.value;
};

const selectOption = option => {
  selectedOption.value = option;
  modelOption.value=option;
  showDropdown.value = false;
  emit('select', option);
};

watch(()=>props.selected,newValue=>(selectedOption.value=newValue,modelOption.value=newValue))
const closeDropdown = () => { showDropdown.value = false; };
const openDropdown = () => { showDropdown.value = true; };
const emit = defineEmits(['dropDown', 'select', 'click']);

defineExpose({selectOption,toggleDropdown,closeDropdown,openDropdown,selectedOption})

</script>


<style scoped src="@css/MySelect.vue.css" />
