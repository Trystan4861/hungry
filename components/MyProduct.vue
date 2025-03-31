<template>
  <div class="my-product"
    @contextmenu.prevent
    :data-supermercado="product.id_supermercado"
    :data-categoria="product.id_categoria"
  >
    <span
      :style="{ backgroundColor: categoryColor }"
      class="productCategory"
      @click="handleCategoryClick"></span>
    <div
      class="product"
      :class="{ selected: product.selected }"
      @click="props.canBeDone ? handleDoneClick : handleTap"
    >
      <div class="productText"
        :class="{ 'done': props.canBeDone && product.done }"
        @click="props.canBeDone ? handleDoneClick() : handleTap()">
        <span class="productAmount">{{ props.product.amount }}&nbsp;</span>
        <span class="productName" v-html="productName"></span>
      </div>
      <div class="iconos" v-if="!props.canBeDone">
        <div
          v-if="props.product.selected"
          class="plus"
          @click.stop="incrementAmount"
        >
          ➕
        </div>
        <div
          v-if="props.product.selected"
          class="minus"
          @click.stop="decrementAmount"
        >
          <div v-if="props.product.amount > 1">➖</div>
          <div v-else class="rotate-45">➕</div>
        </div>
        <div
          v-if="showEdit && !props.product.selected"
          class="edit"
          @mousedown="handleEditClick"
          @mouseup="clearEditTimeout"
        >
          ✏️
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { myStore } from '~/composables/useStore';
import type { Producto } from '~/types';
import { parseEmoji } from '~/utils';

// Props
const props = defineProps({
  product: { type: Object as () => Producto, required: true },
  canBeDone: { type: Boolean, default: false },
  showEdit: { type: Boolean, default: true },
  editLongClickTimeOut: { type: Number, default: 2000 },
});

// Emits
const emit = defineEmits<{
  (e: 'update:selected', value: boolean): void;
  (e: 'update:amount', value: number): void;
  (e: 'update:done', value: boolean): void;
  (e: 'click:edit', product: Producto): void;
}>();

// Store
const store = myStore();

// Estado local
const isDragging = ref(false);
const editLongClickTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Computed
const categoryColor = computed(() =>
  store.categorias.value.find(c => c.id === props.product.id_categoria)?.bgColor ?? "#fff"
);

const productName = computed(() => parseEmoji(props.product.text));

// Métodos
function handleTap() {
  if (isDragging.value) return;
  if (!props.product.selected) {
    emit('update:selected', true);
    emit('update:amount', 1);
  }
}

function emitEdit() {
  emit('click:edit', props.product);
  clearEditTimeout();
}
function clearEditTimeout() {
  if (editLongClickTimeout.value) {
    clearTimeout(editLongClickTimeout.value);
    editLongClickTimeout.value = null;
  }
}

function handleEditClick() {
  if (editLongClickTimeout.value) {
    clearEditTimeout();
  } else {
    editLongClickTimeout.value = setTimeout(() => emitEdit(), props.editLongClickTimeOut);
  }
}

function handleCategoryClick() {
  if (props.product.selected) {
    if (props.canBeDone) {
      emit('update:done', !props.product.done);
    }
    else {
      emit('update:selected', false);
      emit('update:amount', 1);
    }
  }
  else {
    emit('update:selected', true);
    emit('update:amount', 1);
  }
}

function incrementAmount() {
  emit('update:amount', props.product.amount + 1);
}

function decrementAmount() {
  if (props.product.amount > 1) {
    emit('update:amount', props.product.amount - 1);
  } else {
    emit('update:selected', false);
  }
}

function handleDoneClick() {
  emit('update:done', !props.product.done);
}
</script>

<style scoped>
.iconos {
  display: flex;
  align-items: center;
  justify-content: center;
}

.iconos div {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 1.5625rem;
  height: 1.5625rem;
  margin: 0 0.25rem;
}

.productCategory {
  height: 1.5625rem;
  width: 1.5625rem;
  margin-top: 1px;
  position: relative;

}

.my-product {
  cursor: pointer;
  display: flex;
  height: 1.875rem;
  margin-bottom: 1px;
  user-select: none;
  width: auto;
}

.product {
  display: flex;
  padding-left: 0.625rem;
  width: 100%;
  text-align: start;
  align-items: center;
}

.selected {
  font-weight: bold;
}


.productAmount {
  min-width: 1.5rem;
  text-align: center;
}

.productText {
  flex: 1;
  padding: 0.25rem 0;
}

.plus, .minus {
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rotate-45 {
  transform: rotate(45deg);
  transform-origin: center;
}

.emoji {
  font-family: 'Noto Color Emoji', 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif;
}

.done {
  text-decoration: line-through;
  opacity: 0.7;
}
</style>