<template>
  <div class="my-select" ref="selectRef" @blur="closeDropdown">
    <div @click="toggleDropdown" class="selected-option" tabindex="0" :class="[(addFilter2Images.includes(selectedOption.logo) ? 'white' : ''), showDropdown ? 'show' : '']">
      <MyImage :image="selectedOption.logo" v-if="!hideSelectedImage" />
      <div class="label" :class="{ 'noimage': hideSelectedImage }">{{ selectedOption.text ? selectedOption.text : placeholder }}</div>
    </div>
    <div class="dropdown" :class="{ show: showDropdown }" :style="{ top: dropdownTop + 'px', left: dropdownLeft + 'px', width: dropdownWidth + 'px' }">
      <div
        v-for="option in options"
        :key="option.id"
        class="option"
        :class="addFilter2Images.includes(option.logo)?'filter':''"
        @mouseup="selectOption(option)"
      >
        <MyImage :image="option.logo" :className="'option-logo'" />
        <div class="label">{{ option.text }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { Supermercado, Tab } from '~/types';

const selectRef = ref<HTMLElement | null>(null);

const props = defineProps({
  hideSelectedImage: { type: Boolean, default: false },
  options: { type: Array as () => Supermercado[] | Tab[], required: true },
  placeholder: { type: String, default: 'Seleccione una opción' },
  selected: { type: Object, default: () => ({ id: -1, text: null, logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==" }) }
});

const emit = defineEmits(['dropDown', 'select', 'click']);

const showDropdown = ref(false);
const selectedOption = ref(props.selected);

const addFilter2Images = ['add.svg', 'cart.svg'];

const dropdownTop = ref(0);
const dropdownLeft = ref(0);
const dropdownWidth = ref(0);

const toggleDropdown = () => {
  if (selectRef.value) {
    const rect = selectRef.value.querySelector('.selected-option')?.getBoundingClientRect();
    if (rect) {
      dropdownTop.value = rect.bottom;
      dropdownLeft.value = rect.left;
      dropdownWidth.value = rect.width;
    }
  }
  emit('click', !showDropdown.value ? 'hidden' : 'visible');
  showDropdown.value = !showDropdown.value;
};

const selectOption = (option: Tab | Supermercado) => {
  selectedOption.value = option;
  emit('select', option);
  showDropdown.value = false;
};

watch(() => props.selected, (newValue) => {
  selectedOption.value = newValue;
});

const closeDropdown = () => { showDropdown.value = false; };
const openDropdown = () => { showDropdown.value = true; };

defineExpose({selectOption,toggleDropdown,closeDropdown,openDropdown,selectedOption})

</script>


<style scoped>
  * {
    color: white;
    user-select: none;
  }
  .my-select {
    position: relative;
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
  .selected-option .label {
    width:              60%;
  }
  .selected-option .label.noimage {
    width:              75%;
  }
  .dropdown {
    position:           fixed;
    z-index:            9999;
    background-color: gray;
    border:             .0625rem solid #ccc;
    border-top:         none;
    border-radius:      0 0 .25rem .25rem;
    box-shadow:         0 .125rem .25rem rgba(0, 0, 0, 0.1);
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
    right:              15px;
    /* Posición de la flecha */
    width:              0;
    height:             0;
    border-style:       solid;
    border-width:       15px 15px 0 15px;
    /* Tamaño y forma de la flecha */
    border-color:     #fff transparent transparent transparent;
    /* Color de la flecha */
  }
  .selected-option.show::after {
    transform:          rotate(-180deg);
  }
</style>
