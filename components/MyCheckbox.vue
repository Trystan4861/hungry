<template>
    <div class="my-checkbox d-flex align-items-center cursor-pointer">
      <div v-if="styled">
        <label class="Toggle" :class="group?'mb-1':''" :for="id">
        <input type="checkbox" :name="id" :id="id" class="Toggle__input" :value="value" :checked="internalChecked" :disabled="!props.enabled" @change="handleChange">
          <span class="Toggle__display" :style="{ backgroundColor:internalChecked?checkedColor:uncheckedColor, '--diameter': dotDiameter}">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="Toggle__icon" :style="{color: checkmarkColor}">
              <path d="M6.08471 10.6237L2.29164 6.83059L1 8.11313L6.08471 13.1978L17 2.28255L15.7175 1L6.08471 10.6237Z" fill="currentcolor" stroke="currentcolor"></path>
            </svg>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="Toggle__icon Toggle__icon--cross" :style="{color: crossColor}">
              <path d="M11.167 0L6.5 4.667L1.833 0L0 1.833L4.667 6.5L0 11.167L1.833 13L6.5 8.333L11.167 13L13 11.167L8.333 6.5L13 1.833L11.167 0Z" fill="currentcolor"></path>
            </svg>
          </span>
          <slot>
            {{label}}
          </slot>
        </label>
      </div>
      <div v-else>
        <input
          type="checkbox"
          :id="id"
          :value="value"
          :checked="internalChecked"
          @change="handleChange"
          :disabled="!props.enabled"
        >
        <label :for="id">{{ label }}</label>
      </div>
    </div>
  </template>

  <script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import '~/css/components/MyCheckbox.css';

  const props=defineProps({
    value:          { type: [String, Number], required: true    },
    label:          { type: String,   default: 'Checkbox'       },
    group:          { type: String || null,   default: null     },
    enabled:        { type: Boolean,  default: true             },
    checkedValues:  { type: Array,    default: () => []         },
    required:       { type: Boolean,  default: false            },
    selected:       { type: Boolean,  default: false            },
    styled:         { type: Boolean,  default: false            },
    checkmarkColor: { type: String,   default: 'white'          },
    crossColor:     { type: String,   default: 'white'          },
    checkedColor:   { type: String,   default: "#6c757d"        },
    uncheckedColor: { type: String,   default: '#333'           },
    dotDiameter:    { type: String,   default: '1rem'           },
  });

  const id            = `'checkbox-${props.value}-${props.group}`;
  const isChecked     = computed(() => (props.group ? props.checkedValues?.includes(props.value) : props.selected));
  const emit          = defineEmits(['lastCheckedDeletionAttempt','checkedValues','checkedValue'])
  const internalChecked = ref(isChecked.value);

  const handleChange  = (event: Event) => {
    if (!event.target) return;
    const target = event.target as HTMLInputElement;

    if (props.group !== null) {
      // Crear una copia del array actual
      const currentValues = [...props.checkedValues];
      const valueIndex = currentValues.indexOf(props.value);
      const isCurrentlyChecked = valueIndex !== -1;

      // Si intenta desmarcar y es requerido
      if (props.required && !target.checked) {
        // Si es el último valor o solo hay uno, impedir desmarcado
        if (currentValues.length === 1) {
          target.checked = true;
          internalChecked.value = true;
          emit('lastCheckedDeletionAttempt', currentValues);
          return;
        }
      }

      // Si pasó la validación, actualizar estado
      internalChecked.value = target.checked;

      // Actualizar array de valores
      if (target.checked && !isCurrentlyChecked) {
        currentValues.push(props.value);
      } else if (!target.checked && isCurrentlyChecked) {
        currentValues.splice(valueIndex, 1);
      }

      emit('checkedValues', currentValues);
    } else {
      internalChecked.value = target.checked;
      emit('checkedValue', target.checked);
    }
  };

  // Actualizar el estado interno cuando cambia el prop
  watch(isChecked, (newValue) => {
    internalChecked.value = newValue;
  });

  // Actualizar el estado interno cuando cambia el array de valores
  watch(() => props.checkedValues, (newValue) => {
    internalChecked.value = newValue?.includes(props.value) || false;
  });
  </script>


