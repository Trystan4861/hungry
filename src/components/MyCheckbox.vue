<template>
  <div class="d-flex align-items-center cursor-pointer">
    <div v-if="styled">
      <label class="Toggle" :class="group?'mb-1':''" :for="id" @click="handleChange">
      <input type="checkbox" :name="id" :id="id" class="Toggle__input" :value="value" :checked="isChecked">
        <span class="Toggle__display" :style="{ backgroundColor:isChecked?checkedColor:uncheckedColor, '--diameter': dotDiameter}">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="Toggle__icon" :style="{color: checkmarkColor}">
            <path d="M6.08471 10.6237L2.29164 6.83059L1 8.11313L6.08471 13.1978L17 2.28255L15.7175 1L6.08471 10.6237Z" fill="currentcolor" stroke="currentcolor"></path>
          </svg>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="Toggle__icon Toggle__icon--cross" :style="{color: crossColor}">
            <path d="M11.167 0L6.5 4.667L1.833 0L0 1.833L4.667 6.5L0 11.167L1.833 13L6.5 8.333L11.167 13L13 11.167L8.333 6.5L13 1.833L11.167 0Z" fill="currentcolor"></path>
          </svg>
        </span>
      {{label}}
      </label>
    </div>
    <div v-else>
      <input
        type="checkbox"
        :id="id"
        :value="value"
        :checked="isChecked"
        @click="handleChange"
      >
      <label :for="id">{{ label }}</label>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props=defineProps({
  value:          { required: true                      },
  label:          { type: String,   default: ''         },
  group:          { type: String                        },
  checkedValues:  { type: Array                         },
  required:       { type: Boolean,  default: false      },
  selected:       { type: Boolean,  default: false      },
  styled:         { type: Boolean,  default: false      },
  checkmarkColor: { type: String,   default: 'white'    }, //'#1fb978'
  crossColor:     { type: String,   default: 'white'    }, //'#e74c3c'
  checkedColor:   { type: String,   default: "#6c757d"  }, //'#e3f5eb'
  uncheckedColor: { type: String,   default: '#333'     }, //'#fbe4e2'
  dotDiameter:    { type: String,   default: '1rem'     }, //'1.25rem'
});

const id            = `'checkbox-${Math.random().toString(36).slice(2)}`;
const isChecked     = computed(() => (props.group ? props.checkedValues.includes(props.value) : props.selected));
const emit          = defineEmits(['lastCheckedDeletionAttempt','update:checkedValues','update:checkedValue'])
const handleChange  = event => {
  if (typeof event.target.checked === 'undefined') return;
  if (props.group) {
    if (props.required && !event.target.checked && props.checkedValues.length === 1 && isChecked.value) {
      emit('lastCheckedDeletionAttempt', props.checkedValues);
      return event.preventDefault();
    }
    emit('update:checkedValues', (event.target.checked)?[...props.checkedValues, props.value]:props.checkedValues.filter(val => val !== props.value));
  } else {
    emit('update:checkedValue', props.value, event.target.checked);
  }
};
</script>


<style scoped src="@css/MyCheckbox.vue.css" />
