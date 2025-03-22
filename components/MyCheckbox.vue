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

  const props=defineProps({
    value:          { type: [String, Number], required: true    },
    label:          { type: String,   default: 'Checkbox'       },
    group:          { type: String || null,   default: null     },
    enabled:        { type: Boolean,  default: true             },
    checkedValues:  { type: Array,    default: () => []         },
    required:       { type: Boolean,  default: false            },
    selected:       { type: Boolean,  default: false            },
    styled:         { type: Boolean,  default: false            },
    checkmarkColor: { type: String,   default: 'white'          }, //'#1fb978'
    crossColor:     { type: String,   default: 'white'          }, //'#e74c3c'
    checkedColor:   { type: String,   default: "#6c757d"        },
    uncheckedColor: { type: String,   default: "#6c757d"        },
    dotDiameter:    { type: String,   default: "1.5em"          }
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

  <style scoped>
  .cursor-pointer *{
    cursor:             pointer;
  }
  label {
    padding-left:       .625rem;
    padding-top:        0rem;
  }
  input[type=checkbox]
  {
    margin-left:        .625rem;
  }
  .Toggle {
    align-items:        center;
    cursor:             pointer;
    display:            flex;
    flex-wrap:          nowrap;
    gap:                1ch;
    position:           relative;
  }

  .Toggle__input {
    height:             100%;
    position:           absolute;
    opacity:            0;
    width:              100%;
  }

  .Toggle__display {
    --diameter:         1.8em;
    --offset:           0.25em;
    align-items:        center;
    box-sizing:         content-box;
    border:             0.1em solid rgb(0 0 0 / 0.2);
    border-radius:      100vw;
    display:            inline-flex;
    height:             calc(var(--diameter) + var(--offset) * 2);
    justify-content:    space-around;
    position:           relative;
    transition:         250ms;
    width:              calc(var(--diameter) * 2 + var(--offset) * 2);
  }

  .Toggle__display::before {
    background-color: white;
    border:             0.1em solid rgb(0 0 0 / 0.2);
    border-radius:      50%;
    box-sizing:         border-box;
    content:            "";
    height:             var(--diameter);
    left:               var(--offset);
    position:           absolute;
    top:                50%;
    transform:          translate(0, -50%);
    transition:         inherit;
    width:              var(--diameter);
    will-change:        transform;
    z-index:            2;
  }


  .Toggle:focus                               .Toggle__display,
  .Toggle:focus:not(:focus-visible)           .Toggle__display,
  .Toggle__input:focus +                      .Toggle__display,
  .Toggle__input:focus:not(:focus-visible) +  .Toggle__display {
    outline:            1px dotted #212121;
    outline:            1px auto -webkit-focus-ring-color;
    outline-offset:     2px;
  }

  .Toggle:focus,
  .Toggle:focus:not(:focus-visible)           .Toggle__display,
  .Toggle__input:focus,
  .Toggle__input:focus:not(:focus-visible) +  .Toggle__display {
    outline: 0;
  }

              .Toggle__input:checked  +       .Toggle__display::before,
  [dir="rtl"] .Toggle__input:checked  +       .Toggle__display::before {
    transform:          translateX(100%) translateY(-50%);
  }

  .Toggle[disabled]                           .Toggle__display,
  .Toggle__input:disabled +                   .Toggle__display {
    cursor:             not-allowed;
    filter:             grayscale(40%);
    opacity:            0.6;
  }

  [dir="rtl"]                                 .Toggle__display::before {
    left:               auto;
    right:              var(--offset);
  }

  [dir="rtl"] .Toggle__input:checked +        .Toggle__display::before {
    transform:          translateX(-100%) translateY(-50%);
  }

  .Toggle__icon {
    color:              inherit;
    display:            inline-block;
    fill:               currentcolor;
    font-size:          calc(var(--diameter) / 2);
    height:             1em;
    overflow:           hidden;
    vertical-align:     middle;
    width:              1em;
  }

  *,*::before,*::after {
    box-sizing:         border-box;
  }
  </style>
