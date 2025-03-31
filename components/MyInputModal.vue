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
import { ref, defineProps, defineEmits } from 'vue';
import MyInput from './MyInput.vue';

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

<style scoped>
.modal-title {
  font-size: 1.25rem;
  margin: 0;
  font-weight: bold;
  color: #000;
  text-align: center;
  width: 100%;
}
.my-input-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background-color: white;
  border-radius: 0.3rem;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

.btn {
  cursor: pointer;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-secondary {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-close {
  background: transparent;
  border: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  opacity: 0.5;
  cursor: pointer;
}
</style>