<template>
  <div>
    <div class="my-product-list">
      <my-product v-for="(product, index) in sortedProductList" 
      :key="index" 
      :product="product"
      :canBeDone="canBeDone" 
      @product:click="handleClick(product)" 
      @product:longClick="handleLongClick(product)"
      @product:drag="handleDrag"
      />
    </div>
  </div>
</template>

<script>
import MyProduct from '@/components/MyProduct.vue';

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
    handleDrag(direction,product)
    {
      if(direction=='left')
      {
        product.amount-=1
        if (product.amount==0)
          product.selected=false
      }
      else
        product.amount+=1
    },
    handleClick(product){
      if (product.amount<0) product.amount=1
      this.$emit('click:product',product)
      },
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
              return product.id_supermercado !== this.supermercado && product.id_supermercado !== 0;
            }
            else {
              return product.id_supermercado === this.supermercado || product.id_supermercado === 0;
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
