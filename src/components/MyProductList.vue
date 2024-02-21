<template>
  <div>
    <div class="my-product-list">
      <MyProduct v-for="(product, index) in sortedProductList" :key="index" :product="product" />
    </div>
  </div>
</template>

<script>
import MyProduct from './MyProduct.vue';

export default {
  name: 'MyProductList',
  components: {
    MyProduct
  },
  props: {
    productList: {
      type: Array,
      required: true
    },
    orderBy: {
      type: String,
      default: 'name' // Valor por defecto: ordenar por nombre
    }
  },
computed: {
    sortedProductList() {
      if (this.orderBy === 'name') {
        return this.productList.slice().sort((a, b) => a.text.localeCompare(b.text));
      } else if (this.orderBy === 'categoryId') {
        // Ordenar primero por id_categoria y luego por text
        return this.productList.slice().sort((a, b) => {
          if (a.id_categoria !== b.id_categoria) {
            return a.id_categoria - b.id_categoria;
          } else {
            return a.text.localeCompare(b.text);
          }
        });
      }
      return this.productList;
    }
  }
};
</script>
<style scoped>
.my-product-list {
  margin-top: 1.25rem;
  margin-left: .625rem;
  display: flex;
  flex-wrap: wrap;
}
</style>
