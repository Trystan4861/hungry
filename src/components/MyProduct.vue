<template>
  <div class="my-product" :data-supermercado="product.id_supermercado" :data-categoria="product.id_categoria" @click="handleClick">
    <span  :style="{ backgroundColor: product.categoria.bgColor }" class="categoria-producto" />
    <p :style="{display: product.amount !== 0?'none':'block'}" class="amount">{{ product.amount }}</p>
    <p class="text">{{ product.text }}</p>
  </div>
</template>

<script>
export default {
  name: 'MyProduct',
  props: {
    product: {
      type: Object,
      required: true
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
.categoria-producto{
  width: 25px;
  height: 25px;
}
.my-product {
  width: 100%;
  height: 30px;
  padding-left: 10px;
  display: flex;
  cursor: pointer;
}
.text{
  padding-left: 15px;
}
.amount {
  color: white;
  font-size: 18px;
  padding-left: 20px;
}
</style>