<template>
  <div  v-show="productosSeleccionados.length>0">
      <div class="mr-0 d-flex filaAcciones">
        <MySelect
        class="flex-grow-1"
        ref="supermarketAtShoppingList"
        :options="supermercadosAMostrar" 
        :selected="supermercadosAMostrar[0]" 
        v-show="supermercadosVisibles.length > 1"
        />
        <div class="shoppingList" v-show="supermercadosVisibles.length == 1">LISTA DE LA COMPRA</div>
        <MyButton
        btnClass="danger bold" 
        class="clearList"
        text="Limpiar Lista" 
        :styleButton="{width: anchoBoton,borderRadius:'0px'}"
        @click="clearList" />
      </div>
    </div>
    <MyCard
    borderStyle="rounded-bottom"
    :heightModifier="productosSeleccionados.length>0?-50:0" 
    >
      <div class="text-end" v-show="productosSeleccionados.length>0">{{ amount2Buy }} producto{{ amount2Buy!=1?'s':'' }} por comprar</div>
      <div class="h-100" v-show="productosSeleccionados.length==0">
        <div class="d-flex justify-content-center align-items-center h-100"><h2 class="text-uppercase text-center">La lista de la compra está vacía</h2></div>
      </div> 
      <div v-show="AmountInThisSupermarket>0"
        >
        <div class="w-100 text-center mt-2">Puedes comprar en {{ supermercado }}: {{ AmountInThisSupermarket }} producto{{ AmountInThisSupermarket>1?'s':'' }}<hr /></div>
        <MyProductList 
          orderBy="categoryId" 
          :canBeDone="true" 
          filter="undone"
          :productList="productosSeleccionados" 
          :selected="true" 
          :supermercado="id_supermercado || 0" 
          @click="handleShoplistClick" 
          />
      </div>
      <div v-show="AmountInOtherSupermarkets>0 && supermercadosVisibles.length > 1">
        <div class="w-100 text-center" v-if="supermercadosAMostrar.length>1">Puedes comprar en otros Supermercados: {{ AmountInOtherSupermarkets }} producto{{ AmountInOtherSupermarkets>1?'s':'' }}<hr /></div>
        <div class="w-100 text-center" v-else>En Supermercados ocultos: {{ AmountInOtherSupermarkets }} producto{{ AmountInOtherSupermarkets>1?'s':'' }}<hr /></div>
        <MyProductList 
          orderBy="categoryId" 
          :canBeDone="true" 
          filter="undone"
          :hideSupermercado="true" 
          :productList="productosSeleccionados" 
          :selected="true" 
          :supermercado="id_supermercado || 0" 
          @click="handleShoplistClick" 
          />
      </div>
      <div v-show="amountBuyed>0">
        <div class="w-100 text-center">Productos comprados: {{ amountBuyed }} producto{{ amountBuyed!=1?'s':'' }}<hr /></div>
        <MyProductList 
          orderBy="categoryId" 
          :canBeDone="true" 
          :productList="productosSeleccionados" 
          :selected="true" 
          filter="done"
          @click="handleShoplistClick" 
          />
      </div>
  </MyCard>
</template>
<script setup>
  import MySelect from '@components/MySelect.vue';
  import MyButton from '@components/MyButton.vue';
  import MyCard from '@components/MyCard.vue';
  import MyProductList from '@components/MyProductList.vue';
  import Swal from 'sweetalert2';
  import { ref, computed, watch,onMounted } from 'vue';
  import { _DOM, createCopy, findIndexById }            from '@/utilidades'
  import { useStore } from 'vuex';
  import { localStorageService } from '@/localStorageService';

  const props=defineProps({
    active:       {type:Boolean,required:true}
  })
  const store                           = useStore()
  const storeGet                        = store.getters

  const productsData                    = computed(()=>storeGet.getProductos())
  const categoriesData                  = computed(()=>storeGet.getCategorias())

  const supermarketAtShoppingList       = ref(null)
  const supermercadosVisibles           = computed(()=>storeGet.getSupermercados().filter(i=>i.visible))
  
  const supermercadosAMostrar           = computed(()=>filterSupermercados())

  const id_supermercado                 = computed(()=>supermarketAtShoppingList.value?.selectedOption.id)
  const supermercado                    = computed(()=>supermarketAtShoppingList.value?.selectedOption.text)

  const idsCategoriasVisibles           = computed(()=>createCopy(categoriesData.value).filter(item=>item.visible).map(item=>item.id))
  const productosDeCategoriasVisibles   = computed(()=>productsData.value.filter(producto => idsCategoriasVisibles.value.includes(producto.id_categoria)))
  const productosSeleccionados          = computed(()=>productosDeCategoriasVisibles.value.filter(item=>item.selected))
  const amount2Buy                      = computed(()=>productosSeleccionados.value.filter(i=>!i.done).length)
  const amountBuyed                     = computed(()=>productosSeleccionados.value.length-amount2Buy.value)
  const lastClick                       = ref(Date.now())

  const filterSupermercados=()=>{
    let aux=createCopy(supermercadosVisibles.value)
    if (aux.length>1)
    {
      aux=aux.filter(i=>i.id!=0)
    }
    return aux
  }

  const AmountInThisSupermarket=computed(()=>
    productosSeleccionados.value.filter(item=>
      item.selected 
      && (item.id_supermercado==(id_supermercado.value) || item.id_supermercado==0) 
      && !item.done
    ).length)
  const AmountInOtherSupermarkets=computed(()=>amount2Buy.value-AmountInThisSupermarket.value)

  const anchoBoton=ref('100px')
  const recalculateAnchoBoton=()=>anchoBoton.value=(_DOM(".nav-item:last-child")?.getClientRects()[0].width ?? 100)+'px'

  window.addEventListener('resize',()=>setTimeout(recalculateAnchoBoton,50))
  watch(() => props.active, newValue => newValue && recalculateAnchoBoton());

  onMounted(()=>setTimeout(recalculateAnchoBoton,500))
  
  
  
  const handleShoplistClick=item=>{
    if(Date.now()-lastClick.value>200)
    {
      productsData.value[findIndexById(item.id,productsData.value)].done=!productsData.value[findIndexById(item.id,productsData.value)].done
      setProductsData(productsData.value)
      lastClick.value=Date.now()
    }
  }
  const clearList=()=>{
        const productosSeleccionados=productsData.value.filter(item=>item.selected)
        const auxClearList=productosSeleccionados.some(item=>item.done) && !productosSeleccionados.every(item=>item.done)
        Swal.fire({
          title: `Atención`,
          text: auxClearList?'¿Qué elementos desea eliminar?':'Esto limpiará la lista de la compra',
          showCancelButton: true,
          confirmButtonText: auxClearList?'Todos':'Aceptar',
          denyButtonText: 'Ya Comprados',
          cancelButtonText: 'Cancelar',
          customClass: {
            confirmButton: 'btn btn-danger mr-1', 
            denyButton: 'btn btn-warning mr-1', 
            cancelButton: 'btn btn-success', 
          },
          showDenyButton: auxClearList,
          buttonsStyling: false, 
          target: _DOM("#appContainer"),
        }).then((result) => {
          if (result.isDenied){
            productsData.value.forEach(producto=>{
              if(producto.done)
              {
                producto.selected=false
                producto.done=false;
              }
            })
          }
          else if (result.isConfirmed) {
            productsData.value.forEach(producto=>{
              producto.selected=false
              producto.done=false
            })
          }
          setProductsData(productsData.value)
        });      
      }
  const setProductsData =newData=>store.dispatch('setProductos',   localStorageService.setSubItem('productos',   newData))
  watch(productsData,   newData => setProductsData(newData));
  watch(()=>storeGet.getProductos(),newData=>productsData.value!=newData && (productsData.value=newData))
</script>
<style scoped>
.shoppingList{
  background-color: #333;
  flex-grow: 1;
  text-align: center;
  height: 3.125rem;
  align-content: center;
}
.filaAcciones{
  align-items: center;
}
</style>