<template>
  <div  v-show="amount2Buy>0">
      <div class="mr-0 d-flex">
        <MySelect
        class="flex-grow-1"
        ref="supermarketAtShoppingList"
        :options="supermercados.filter(item=>item.id!=0)" 
        :selected="supermercados[1]" 
        />
        <MyButton
        btnClass="danger" 
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
      <div class="h-100" v-show="amount2Buy==0">
        <div class="d-flex justify-content-center align-items-center h-100">La lista de la compra está vacía.</div>
      </div> 
      <div v-show="AmountInThisSupermarket>0"
        >
        <div class="w-100 text-center mt-2">Puedes comprar en {{ supermercado }} {{ AmountInThisSupermarket }} producto{{ AmountInThisSupermarket>1?'s':'' }}<hr /></div>
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
      <div v-show="AmountInOtherSupermarkets>0">
        <div class="w-100 text-center">Puedes comprar en otros Supermercados {{ AmountInOtherSupermarkets }} producto{{ AmountInOtherSupermarkets>1?'s':'' }}<hr /></div>
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
        <div class="w-100 text-center">Ya has comprado {{ amountBuyed }} producto{{ amountBuyed!=1?'s':'' }}<hr /></div>
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
  import { createCopy, findIndexById }            from '@/utilidades'
  import { useStore } from 'vuex';
  import { localStorageService } from '@/localStorageService';

  const store=useStore()
  const storeGet=store.getters
  const props=defineProps({
    active:       {type:Boolean,required:true}
  })
  const supermercados                   = computed(()=>storeGet.getSupermercados())
  const productsData                    = computed(()=>storeGet.getProductos())
  const categoriesData                  = computed(()=>storeGet.getCategorias())
  const idsCategoriasVisibles           = computed(()=>createCopy(categoriesData.value).filter(item=>item.visible).map(item=>item.id))
  const productosDeCategoriasVisibles   = computed(()=>productsData.value.filter(producto => idsCategoriasVisibles.value.includes(producto.id_categoria)))
  const productosSeleccionados          = computed(()=>productosDeCategoriasVisibles.value.filter(item=>item.selected))
  const amount2Buy                      = computed(()=>productosSeleccionados.value.filter(i=>!i.done).length)
  const amountBuyed                     = computed(()=>productosSeleccionados.value.filter(i=>i.done).length)
  
  //
  
  const AmountInThisSupermarket=computed(()=>
    productosSeleccionados.value.filter(item=>
      item.selected 
      && (item.id_supermercado==(id_supermercado.value) || item.id_supermercado==0) 
      && !item.done
    ).length)
  const AmountInOtherSupermarkets=computed(()=>amount2Buy.value-AmountInThisSupermarket.value)

  const anchoBoton=ref('100px')
  const recalculateAnchoBoton=()=>anchoBoton.value=(document.querySelector(".nav-item:last-child")?.getClientRects()[0].width ?? 100)+'px'

  window.addEventListener('resize',()=>setTimeout(recalculateAnchoBoton,50))
  watch(() => props.active, newValue => {
  if (newValue) recalculateAnchoBoton()
});
  onMounted(()=>setTimeout(recalculateAnchoBoton,500))
  const id_supermercado=computed(()=>supermarketAtShoppingList.value?.selectedOption.id)
  const supermercado=computed(()=>supermarketAtShoppingList.value?.selectedOption.text)
  const supermarketAtShoppingList=ref(null)
  
  
  
  
  const handleShoplistClick=item=>{
    productsData.value[findIndexById(item.id,productsData.value)].done=!productsData.value[findIndexById(item.id,productsData.value)].done
    setProductsData(productsData.value)
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
          target: document.querySelector("#appContainer"),
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
</style>