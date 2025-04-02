<template>
  <div class="my-input-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ title }}</h5>
        <button type="button" class="btn-close" @click="handleCancel"></button>
      </div>
      <div class="modal-body">
        <MyInput
          v-model="inputValue"
          :placeholder="placeholder"
          :autoFocus="true"
          :maxLength="maxLength"
          @updateValue="handleUpdateValue"
          @keyPressed:enter="handleConfirm"
        />
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-success me-2" @click="handleConfirm">{{ confirmText }}</button>
        <button type="button" class="btn btn-danger" @click="handleCancel">{{ cancelText }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MyInput from './MyInput.vue';
import '~/css/components/MyInputModal.css';

const props = defineProps({
  title: { type: String, required: true },
  initialValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  confirmText: { type: String, default: 'Aceptar' },
  cancelText: { type: String, default: 'Cancelar' },
  maxLength: { type: Number, default: 30 }
});

const emit = defineEmits(['confirm', 'cancel', 'update:modelValue']);

const inputValue = ref(props.initialValue);

const handleUpdateValue = (value: string) => {
  inputValue.value = value;
  emit('update:modelValue', value);
};

const handleConfirm = () => {
  if (inputValue.value.trim() !== '') {
    emit('confirm', inputValue.value);
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>

