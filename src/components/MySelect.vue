<template>
  <div class="my-select" @click="toggleDropdown">
    <div class="selected-option" tabindex="0" @blur="closeDropdown"><img :src="selectedOption.logo">{{ selectedOption.text ? selectedOption.text : placeholder }}</div>
    <div class="dropdown" :class="{ show: showDropdown }">
      <div v-for="(option, index) in options" :key="index" class="option" @mousedown="selectOption(option,index)">
        <img :src="option.logo" alt="Logo" class="option-logo"> {{ option.text }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MySelect',
  props: {
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Seleccione una opción'
    }
  },
  data() {
    return {
      selectedOption: {text:null,logo:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="},
      showDropdown: false
    };
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    selectOption(option,index) {
      this.selectedOption = option;
      this.showDropdown = false;
      this.$emit('select', option,index);
    },
    closeDropdown() {
      this.showDropdown = false;
    }
  }
};
</script>

<style scoped>
.my-select {
  position: relative;
  width: 100%;
}

.selected-option {
  padding-left: 10px;
  background-color: gray;
  border: 1px solid #ccc;
  cursor: pointer;
  height: 50px;
  flex-wrap: wrap;
  align-items: center;
  display: flex;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: gray;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: none;
}

.dropdown.show {
  display: block;
}

.dropdown .option {
  padding-left: 10px;
  padding-bottom: 10px;
  cursor: pointer;
}

.dropdown .option:hover {
  background-color: lightgray;
  color: black;
}
.option{
  max-height: 50px;
}
.my-select img{
  max-height: 45px;
}
</style>
