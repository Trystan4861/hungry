<template>
  <div class="my-select" ref="selectRef" @blur="closeDropdown">
    <div @click="toggleDropdown" class="selected-option" tabindex="0" :class="[(addFilter2Images.includes(selectedOption.logo || '') ? 'white' : ''), showDropdown ? 'show' : '']">
      <MyImage :image="selectedOption.logo || ''" v-if="!hideSelectedImage" />
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
import type { Supermercado, Tab, MySelectOption } from '~/types';
import '~/css/components/MySelect.css';

const selectRef = ref<HTMLElement | null>(null);

const props = defineProps({
  hideSelectedImage: { type: Boolean, default: false },
  options: { type: Array as () => Supermercado[] | Tab[], required: true },
  placeholder: { type: String, default: 'Seleccione una opción' },
  selected: {
    type: Object as () => MySelectOption,
    default: () => ({
      id: -1,
      text: null,
      logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="
    })
  }
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

const selectOption = (option: MySelectOption) => {
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



