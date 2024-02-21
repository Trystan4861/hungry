<template>
  <div class="my-product" :data-supermercado="product.id_supermercado" :data-categoria="product.id_categoria" @click="handleClick">
    <span  :style="{ backgroundColor: product.categoria.bgColor }" class="productCategory" />
    <div :style="{display: isSelected ? 'flex' : 'none'}" class="product" :class="{selected: isSelected, done: isDone}">
      <p class="productAmount">{{ product.amount || 1 }}</p>
      <p class="productText">{{ product.text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyProduct',
  props: {
    product: {
      type: Object,
      required: true
    },
    isSelected:{
      type: Boolean,
      default:true
    },
    isDone:{
      type: Boolean,
      default: true
    }
  },
  methods:{
    handleClick(){
      this.$emit('click');
    }
  },
  emits:['click']
};
</script>

<style scoped>
.productCategory{
  width: 1.5625rem;
  height: 1.5625rem;
}
.my-product {
  width: 100%;
  height: 1.875rem;
  display: flex;
  cursor: pointer;
}
.product{
  padding-left: .625rem;
}
.selected{
  font-weight: bold;
}
.done{
  text-decoration: line-through;
}
</style>