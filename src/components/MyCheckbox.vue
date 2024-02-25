<template>
  <div class="d-flex align-items-center">
    <input
      type="checkbox"
      :id="id"
      :value="value"
      :checked="isChecked"
      @click="handleChange"
    >
    <label :for="id">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: 'MyCheckbox',
  props: {
    value: {
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    group: {
      type: String
    },
    checkedValues: {
      type: Array
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    id() {
      return 'checkbox-' + this.value;
    },
    isChecked() {
      return this.checkedValues.includes(this.value);
    }
  },
  methods: {
    handleChange(event) {
      if (this.group && this.required) {
        if (!event.target.checked && this.checkedValues.length === 1 && this.isChecked) {
          this.$emit('lastCheckedDeletionAttempt',this.checkedValues);
          event.preventDefault();
          return;
        }
      }
      if (this.group) {
        if (event.target.checked) {
          this.$emit('update:checkedValues', [...this.checkedValues, this.value]);
        } else {
          this.$emit('update:checkedValues', this.checkedValues.filter(val => val !== this.value));
        }
      } else {
        this.$emit('update:checkedValues', event.target.checked ? [...this.checkedValues, this.value] : this.checkedValues.filter(val => val !== this.value));
      }
    }
  }
};
</script>
<style scoped>
  label{
    padding-left: .625rem;
    padding-top: 0rem ;
  }
</style>