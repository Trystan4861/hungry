<template>
  <div>
    <div class="my-product-list">
      <MyProduct v-for="(product, index) in sortedProductList" 
      :key="index" 
      :product="product"
      :canBeDone="canBeDone" 
      @click:product="handleClick(product)" 
      @longClick:product="handleLongClick(product)"
      />
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
    productList:      { type: Array,    required: true  },
    orderBy:          { type: String,   default: 'name' },
    selected:         { type: Boolean,  default: false  },
    canBeDone:        { type: Boolean,  default: false  },
    showOnlyDone:     { type: Boolean,  default: false  },
    hideDone:         { type: Boolean,  default: false  },
    hideSupermercado: { type: Boolean,  default: false  },
    supermercado:     { type: Number,   default: 0      },
  },
  methods:{
    handleClick(product){this.$emit('click:product',product)},
    handleLongClick(product){ this.$emit('longClick:product',product)}
  },
  computed: {
    sortedProductList() {
      let aux = this.productList;
      if (this.showOnlyDone) {
        aux = this.productList.filter(product => product.done);
      }
      else if (this.hideDone) {
        aux = this.productList.filter(product => !product.done);
        if (this.supermercado !== 0) {
          aux = aux.filter(product => {
            if (this.hideSupermercado) {
              return product.supermercado.id !== this.supermercado && product.supermercado.id !== 0;
            }
            else {
              return product.supermercado.id === this.supermercado || product.supermercado.id === 0;
            }
          });
        }
      }

      if (this.orderBy === 'name') {
        return aux.slice()
          .filter(item => !this.selected || item.isSelected)
          .sort((a, b) => a.text.localeCompare(b.text));
      } else {
        // Ordenar primero por id_categoria y luego por text
        return aux.slice()
          .filter(item => !this.selected || item.selected)
          .sort((a, b) => {
            if (a.id_categoria !== b.id_categoria) {
              return a.id_categoria - b.id_categoria;
            } else {
              return a.text.localeCompare(b.text);
            }
          });
      }
    }
  },
  emits:['click:product','longClick:product']
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
