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
          @click.stop="emitEdit"
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
import '~/css/components/MyProduct.css';

// Props
const props = defineProps({
  product: { type: Object as () => Producto, required: true },
  canBeDone: { type: Boolean, default: false },
  showEdit: { type: Boolean, default: true },
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

