<template>
  <div class="product-list">
    <MyProduct v-for="product in visibleProducts"
      :key="product.id"
      :product="product"
      :can-be-done="canBeDone"
      :show-edit="showEdit"
      :amount="product.amount"
      @click:edit="handleEditClick(product)"
      @update:amount="handleUpdateAmount(product, $event)"
      @update:done="handleUpdateDone(product, $event)"
      @update:selected="handleUpdateSelected(product)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted }  from 'vue';
import MyProduct from './MyProduct.vue';
import type { Producto } from '~/types';
import '~/css/components/MyProductList.css';

const props = defineProps({
  canBeDone: { type: Boolean, default: false },
  showEdit: { type: Boolean, default: true },
  productList: { type: Array<Producto>, required: true },
});

const INITIAL_LOAD = 20;
const CHUNK_SIZE = 10;

const lastClick = ref(Date.now());
const loadedCount = ref(INITIAL_LOAD);
const isLoadingMore = ref(false);

const visibleProducts = computed(() => {
  return props.productList.slice(0, loadedCount.value);
});

const emit = defineEmits(['click:edit', 'update:selected', 'update:amount', 'update:done']);

const handleEditClick = (product: Producto) => emit('click:edit', product);
const handleUpdateSelected = (product: Producto) => {
  if (Date.now() - lastClick.value > 100) {
    lastClick.value = Date.now();
    if (product.amount === 0) product.amount = 1;
    emit('update:selected', product);
  }
};

const handleUpdateAmount = (product: Producto, value: number) => {
  product.amount = value;
  emit('update:amount', product, value);
};

const handleUpdateDone = (product: Producto, value: boolean) => {
  product.done = value;
  emit('update:done', product, value);
};

const loadProductsChunk = () => {
  if (isLoadingMore.value || loadedCount.value >= props.productList.length) return;

  isLoadingMore.value = true;
  requestAnimationFrame(() => {
    loadedCount.value = Math.min(
      loadedCount.value + CHUNK_SIZE,
      props.productList.length
    );
    isLoadingMore.value = false;

    if (loadedCount.value < props.productList.length) {
      requestAnimationFrame(loadProductsChunk);
    }
  });
};

onMounted(() => {
  loadedCount.value = INITIAL_LOAD;
  setTimeout(loadProductsChunk, 250);
});
</script>