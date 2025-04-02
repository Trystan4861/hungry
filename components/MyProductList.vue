<template>
  <div>
    <div class="my-product-list">
      <MyProduct v-for="product in productList"
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
  </div>
</template>

<script lang="ts" setup>
import { ref }  from 'vue';
import MyProduct from './MyProduct.vue';
// Importación relativa mientras se resuelve el problema con el alias
import type { Producto } from '~/types';
import '~/css/components/MyProductList.css';

const props = defineProps({
  canBeDone:        { type: Boolean,  default:  false },
  showEdit:         { type: Boolean,  default:  true   },
  productList:      { type: Array<Producto>,    required: true  },
});

const lastClick           = ref(Date.now())
const emit                = defineEmits(['click:edit',  'update:selected', 'update:amount', 'update:done']);

const handleEditClick     = (product: Producto) => emit('click:edit', product)
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

</script>



