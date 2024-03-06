<template>
  <div class="my-select" @click="toggleDropdown" @blur="closeDropdown">
    <div class="selected-option" tabindex="0">
      <my-image-loader :image="selectedOption.logo" />
      {{ selectedOption.text ? selectedOption.text : placeholder }}
    </div>
    <div class="dropdown" :class="{ show: showDropdown }">
      <div v-for="(option, index) in options" :key="index" class="option" @mousedown="selectOption(option)">
        <my-image-loader :image="option.logo" :className="'option-logo'" />
        {{ option.text }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import MyImageLoader from './MyImageLoader.vue';

export default {
  name: 'MySelect',
  props: {
    options: { type: Array, required: true },
    placeholder: { type: String, default: 'Seleccione una opción' },
    selected: {
      type: Object,
      default: () => ({ id: -1, text: null, logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==" }),
    }
  },
  setup(props,{emit}) {
    const showDropdown = ref(false);
    const selectedOption = ref({ id: -1, text: null, logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==" });

    const toggleDropdown = () => {
      emit('click',!showDropdown.value?'hidden':'visible')
      showDropdown.value = !showDropdown.value; 
      };
    const selectOption = (option) => {
      selectedOption.value = option;
      showDropdown.value = false;
      emit('select', option);
    };
    const closeDropdown = () => { showDropdown.value = false; };
    onMounted(() => {
      if (props.selected.id !== -1) {
        selectedOption.value = props.selected;
        emit('select',props.selected)
      }
    });
    return { showDropdown, selectedOption, toggleDropdown, selectOption, closeDropdown };
  },
  components: { MyImageLoader },
  emits:['dropDown','select']
};
</script>

<style scoped>
*{
  color: white;
  user-select: none;
}
.my-select { position: relative; width: 100%; }
.selected-option { padding-left: .625rem; background-color: gray; border: .0625rem solid #ccc; cursor: pointer; height: 3.125rem; flex-wrap: wrap; align-items: center; display: flex; }
.dropdown { position: absolute; top: 100%; left: 0; width: 100%; background-color: gray; border: .0625rem solid #ccc; border-top: none; border-radius: 0 0 .25rem .25rem; box-shadow: 0 .125rem .25rem rgba(0, 0, 0, 0.1); z-index: 9999; display: none; }
.dropdown.show { display: block; }

.option{ max-height: 3.125rem; padding-top: .625rem; padding-left: .625rem; padding-bottom: .625rem; cursor: pointer; justify-content: flex-start; align-items: center; display: flex; }
.option:hover { background-color: lightgray; color: black; }
img { max-height: 2.8125rem; margin-right: .625rem;}
</style>
