<template>
  <div>
    <div class="my-product-list">
      <MyProduct v-for="product in sortedProductList" 
      :key="product.id" 
      :product="product"
      :canBeDone="canBeDone" 
      :amount="product.amount"
      @click="handleClick(product)" 
      @longClick="handleLongClick(product)"
      @categoryClick="handleCategoryClick(product)"
      @drag="handleDrag"
      :index="product.id"
      :lastClick="lastClick"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref }  from 'vue';
import MyProduct          from '@components/MyProduct.vue';

const props = defineProps({
  canBeDone:        { type: Boolean,  default:  false },
  filter:           { type: String,   default:  ''    },
  hideSupermercado: { type: Boolean,  default:  false },
  orderBy:          { type: String,   default:  'name'},
  productList:      { type: Array,    required: true  },
  selected:         { type: Boolean,  default:  false },
  supermercado:     { type: Number,   default:  0     },
});

const lastClick           = ref(Date.now())
const emit                = defineEmits(['click', 'longClick', 'drag', 'categoryClick']);
const handleDrag          = (dir, product)  => {
  dir === 'left' ? product.amount = (product.amount > 1) ? product.amount - 1 : (product.selected = false, 1) : product.amount += 1 
  emit('drag')
}
const handleLongClick     = product         => emit('longClick', product)
const handleClick         = product         => Date.now() - lastClick.value > 100 && (lastClick.value = Date.now(), product.amount === 0 && (product.amount = 1), emit('click', product));
const handleCategoryClick = product         => emit('categoryClick',product)

const sortedProductList = computed(() => {
  let aux = props.productList.slice();
  //si es una lista especial done||undone filtramos el listado de productos
  if (props.filter.toLowerCase()=="done") {
    aux = aux.filter(product => product.done);
  } else if (props.filter.toLowerCase()=="undone") {
    aux = aux.filter(product => !product.done);
    //para el caso del filtro "undone" si el supermercado actual no es "cualquier supermercado", quitamos los productos que son de otros supermercados
    if (props.supermercado !== 0) {
      aux = aux.filter(product =>  props.hideSupermercado ? 
        (product.id_supermercado !== props.supermercado && product.id_supermercado !== 0) :
        (product.id_supermercado === props.supermercado || product.id_supermercado === 0)
      );
    }
  }
  // devolvemos el listado filtrado y ordenado segun la propiedad filter y la propiedad orderBy respectivamente
  return aux.sort((a, b) => props.orderBy === 'name'?a.text.localeCompare(b.text):a.id_categoria-b.id_categoria||a.text.localeCompare(b.text));
});
</script>


<style scoped>
  .my-product-list {
    margin-top:   1.25rem;
    margin-left:  .625rem;
    display:      flex;
    flex-wrap:    wrap;
  }
</style>
