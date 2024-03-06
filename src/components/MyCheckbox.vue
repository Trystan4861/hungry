<template>
  <div class="d-flex align-items-center cursor-pointer">
    <div v-if="styled">
      <label class="Toggle" :for="id" @click="handleChange">
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

<script>
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'MyCheckbox',
  props: {
    value:          {                 required: true      },
    label:          { type: String,   default:  ''        },
    group:          { type: String                        },
    checkedValues:  { type: Array                         },
    required:       { type: Boolean,  default:  false     },
    selected:       { type: Boolean                       },
    styled:         { type: Boolean,  default:  false     },
    checkmarkColor: { type: String,   default:  "#1fb978" },
    crossColor:     { type: String,   default:  "#e74c3c" },
    checkedColor:   { type: String,   default:  "#e3f5eb" },
    uncheckedColor: { type: String,   default:  "#fbe4e2" },
    dotDiameter:    { type: String,   default:  "1.25rem" },
  },
  setup(props, { emit }) {
    const id = `'checkbox-${Math.random().toString(36).slice(2)}`;
    const isChecked = computed(() => (props.group)?props.checkedValues.includes(props.value):props.selected);

    const handleChange = (event) => {
      if (typeof event.target.checked ==='undefined') return
      if (props.group) {
        if (props.required && !event.target.checked && props.checkedValues.length === 1 && isChecked.value) {
          emit('lastCheckedDeletionAttempt', props.checkedValues);
          return event.preventDefault();
        }
        if (event.target.checked) emit('update:checkedValues', [...props.checkedValues, props.value]);
        else emit('update:checkedValues', props.checkedValues.filter(val=>val!==props.value));
      }
      else{
        emit('update:checkedValue',props.value,event.target.checked)
      }
    };

    return {
      id,
      isChecked,
      handleChange,
    };
  },
  emits: ['update:checkedValues', 'lastCheckedDeletionAttempt','update:checkedValue']
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

.Toggle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  position: relative;
  margin-bottom: 1em;
  cursor: pointer;
  gap: 1ch;
}

.Toggle__input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
}

.Toggle__display {
  --offset: 0.25em;
  --diameter: 1.8em;

  display: inline-flex;
  align-items: center;
  justify-content: space-around;
  box-sizing: content-box;
  width: calc(var(--diameter) * 2 + var(--offset) * 2);
  height: calc(var(--diameter) + var(--offset) * 2);
  border: 0.1em solid rgb(0 0 0 / 0.2);
  position: relative;
  border-radius: 100vw;
  transition: 250ms;
}

.Toggle__display::before {
  content: "";
  z-index: 2;
  position: absolute;
  top: 50%;
  left: var(--offset);
  box-sizing: border-box;
  width: var(--diameter);
  height: var(--diameter);
  border: 0.1em solid rgb(0 0 0 / 0.2);
  border-radius: 50%;
  background-color: white;
  transform: translate(0, -50%);
  will-change: transform;
  transition: inherit;
}


.Toggle:focus .Toggle__display, .Toggle__input:focus + .Toggle__display { outline: 1px dotted #212121; outline: 1px auto -webkit-focus-ring-color; outline-offset: 2px; }
.Toggle:focus, .Toggle:focus:not(:focus-visible) .Toggle__display, .Toggle__input:focus:not(:focus-visible) + .Toggle__display { outline: 0; }
.Toggle__input:checked + .Toggle__display::before { transform: translate(100%, -50%); }

.Toggle[disabled] .Toggle__display, .Toggle__input:disabled + .Toggle__display { opacity: 0.6; filter: grayscale(40%); cursor: not-allowed; }

[dir="rtl"] .Toggle__display::before { left: auto; right: var(--offset); }
[dir="rtl"] .Toggle__input:checked + .Toggle__display::before { transform: translate(-100%, -50%); }

.Toggle__icon { font-size: calc(var(--diameter) / 2); display: inline-block; width: 1em; height: 1em; color: inherit; fill: currentcolor; vertical-align: middle; overflow: hidden; }
*, ::before, ::after { box-sizing: border-box; }
</style>
