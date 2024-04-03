<template>
  <div>
    <div class="my-product-list">
      <MyProduct v-for="(product, index) in sortedProductList" 
      :key="index" 
      :product="product"
      :canBeDone="canBeDone" 
      :amount="product.amount"
      @product:click="handleClick(product)" 
      @product:longClick="handleLongClick(product)"
      @product:drag="handleDrag"
      :index="product.id"

      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import MyProduct from '@components/MyProduct.vue';

const props = defineProps({
  canBeDone:        { type: Boolean,  default:  false },
  hideSupermercado: { type: Boolean,  default:  false },
  orderBy:          { type: String,   default:  'name'},
  productList:      { type: Array,    required: true  },
  selected:         { type: Boolean,  default:  false },
  supermercado:     { type: Number,   default:  0     },
  filter:           { type: String,   default:  ''    }
});

const emit = defineEmits(['click', 'longClick']);

const handleDrag        = (dir, product) => dir === 'left' ? product.amount = (product.amount > 0) ? product.amount - 1 : (product.selected = false, 1) : product.amount += 1;
const handleClick       = product => (product.amount==0?product.amount=1:null,emit('click', product))
const handleLongClick   = product => emit('longClick', product)

const sortedProductList = computed(() => {
  let aux = props.productList;
  //si es una lista especial done||undone filtramos el listado de productos
  if (props.filter.toLowerCase()=="done") {
    aux = props.productList.filter(product => product.done);
  } else if (props.filter.toLowerCase()=="undone") {
    aux = props.productList.filter(product => !product.done);
    //para el caso del filtro "undone" si el supermercado actual no es cualquier supermercado, quitamos los productos que son de otros supermercados
    if (props.supermercado !== 0) {
      aux = aux.filter(product =>  props.hideSupermercado ? 
        (product.id_supermercado !== props.supermercado && product.id_supermercado !== 0) :
        (product.id_supermercado === props.supermercado || product.id_supermercado === 0)
      );
    }
  }

  if (props.orderBy === 'name') {
    return aux.slice()
      .filter(item => !props.selected || item.isSelected)
      .sort((a, b) => a.text.localeCompare(b.text));
  } else {
    return aux.slice()
      .filter(item => !props.selected || item.selected)
      .sort((a, b) => a.id_categoria !== b.id_categoria ?a.id_categoria - b.id_categoria :a.text.localeCompare(b.text));
  }
});
</script>


<style scoped src="@css/MyProductList.vue.css" />
