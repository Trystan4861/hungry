<template>
  <div class="my-select"  @blur="closeDropdown">
    <div @click="toggleDropdown" class="selected-option" tabindex="0" :class="[(addFilter2Images.includes(selectedOption.logo) ? 'white' : ''), showDropdown ? 'show' : '']">
      <MyImage :image="selectedOption.logo" />
      {{ selectedOption.text ? selectedOption.text : placeholder }}
    </div>
    <div class="dropdown" :class="{ show: showDropdown }">
      <div 
        v-for="option in options" 
        :key="option.id" 
        class="option" 
        :class="addFilter2Images.includes(option.logo)?'filter':''" 
        @mouseup="selectOption(option)"
      >
        <MyImage :id="id" :image="option.logo" :className="'option-logo'" />
        <div class="label">{{ option.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import MyImage from '@components/MyImage.vue';
import { generateID } from '@/utilidades'

const props = defineProps({
  modelValue:   { type: Object, },
  options:      { type: Array,  required: true                    },
  placeholder:  { type: String, default:  'Seleccione una opción' },
  selected:     { type: Object, default:  () => ({ id: -1, text: null, logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==" }),
  }
});

const id = `'image-${generateID()}`;
const showDropdown = ref(false);
const selectedOption = ref(props.selected);
const modelOption= ref(props.modelValue)

const addFilter2Images = ['add.svg', 'cart.svg'];

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


<style scoped>
  * {
    color: white;
    user-select: none;
  }
  .my-select { 
    position: relative; 
    width: 100%; 
  }
  .selected-option { 
    padding-left:       .625rem; 
    background-color: #333; 
    border:             .0625rem solid #ccc; 
    cursor:             pointer; 
    height:             3.1875rem;
    flex-wrap:          wrap; 
    align-items:        center; 
    display:            flex; 
  }
  .dropdown { 
    position:           absolute; 
    top:                100%; 
    left:               0; 
    width:              100%; 
    background-color: gray; 
    border:             .0625rem solid #ccc; 
    border-top:         none; 
    border-radius:      0 0 .25rem .25rem; 
    box-shadow:         0 .125rem .25rem rgba(0, 0, 0, 0.1); 
    z-index:            9999; 
    display:            none; 
  }
  .dropdown.show { 
    display:            block; 
    box-shadow:         11px 0px 9px 0px rgba(0,0,0,0.4);
  }

  .option { 
    max-height:         3.125rem; 
    padding-top:        .625rem; 
    padding-left:       .625rem; 
    padding-bottom:     .625rem; 
    cursor:             pointer; 
    justify-content:    flex-start; 
    align-items:        center; 
    display:            flex; 
  }
  .option:hover { 
    background-color: lightgray; 
    color:            black; 
  }
  .option:hover .label { 
    color:            black; 
  }
  img { 
    max-height:         2.8125rem; 
    margin-right:       .625rem;
  }
  .filter .MyImage{ 
    filter:             grayscale(1) brightness(100) invert(1);
  }
  .white .MyImage{
    filter:             grayscale(1) brightness(0) invert(0);
  }
  .selected-option.white .MyImage
  {
    filter: unset !important;
  }
  .label {
    color:            white
  }
  .selected-option::after {
    content:            '';
    position:           absolute;
    top:                50%;
    right:              15px; 
    /* Posición de la flecha */
    transform:          translateY(-50%);
    width:              0;
    height:             0;
    border-style:       solid;
    border-width:       15px 15px 0 15px; 
    /* Tamaño y forma de la flecha */
    border-color:     #fff transparent transparent transparent; 
    /* Color de la flecha */
  }
  .selected-option.show::after {
    transform:          translateY(-50%) rotate(-180deg); 
  }
</style>
