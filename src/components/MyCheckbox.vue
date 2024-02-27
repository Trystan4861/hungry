<template>
  <div class="d-flex align-items-center cursor-pointer">
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
import { computed, defineComponent } from 'vue';

export default defineComponent({
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
  setup(props, { emit }) {
    const id = 'checkbox-' + props.value;

    const isChecked = computed(() => {
      return props.checkedValues.includes(props.value);
    });

    const handleChange = (event) => {
      if (props.group && props.required) {
        if (!event.target.checked && props.checkedValues.length === 1 && isChecked.value) {
          emit('lastCheckedDeletionAttempt', props.checkedValues);
          event.preventDefault();
          return;
        }
      }
      
      if (props.group) {
        if (event.target.checked) {
          emit('update:checkedValues', [...props.checkedValues, props.value]);
        } else {
          emit('update:checkedValues', props.checkedValues.filter(val => val !== props.value));
        }
      } else {
        emit('update:checkedValues', event.target.checked ? [...props.checkedValues, props.value] : props.checkedValues.filter(val => val !== props.value));
      }
    };

    return {
      id,
      isChecked,
      handleChange
    };
  },
  emits: ['update:checkedValues', 'lastCheckedDeletionAttempt']
});
</script>

<style scoped>
.cursor-pointer *{
  cursor:pointer;
}
label {
  padding-left: .625rem;
  padding-top: 0rem;
}
</style>
