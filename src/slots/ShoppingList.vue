<template>
  <div  v-show="productosVisibles.some(i=>i.selected)">
      <div class="mr-0 d-flex">
        <MySelect
        class="flex-grow-1"
        ref="supermarketAtShoppingList"
        :options="props.supermercados.filter(item=>item.id!=0)" 
        :selected="props.supermercados[1]" 
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
      :height="props.alturaDisponible" 
      :heightModifier="productosVisibles.some(i=>i.selected==true)?-50:0" 
      >
      <div class="h-100" v-show="productosVisibles.every(i=>i.selected==false)">
        <div class="d-flex justify-content-center align-items-center h-100">La lista de la compra está vacía.</div>
      </div> 
      <div v-show="
          productosVisibles.some(item=>
          item.selected 
          && (item.id_supermercado==(id_supermercado) || item.id_supermercado==0) 
          && !item.done
          )"
        >
        <div class="w-100 text-center mt-2">Se puede comprar en {{ supermercado }}<hr /></div>
        <MyProductList 
          orderBy="categoryId" 
          :canBeDone="true" 
          filter="undone"
          :productList="productosVisibles" 
          :selected="true" 
          :supermercado="id_supermercado || 0" 
          @click="handleShoplistClick" 
          />
      </div>
      <div v-show="(
        productosVisibles.some(item=>
          item.selected 
          && !item.done 
          && (item.id_supermercado!=(id_supermercado || 0) && (item.id_supermercado!=0))
        )
      ) || 0">
        <div class="w-100 text-center">Para comprar en otros Supermercados<hr /></div>
        <MyProductList 
          orderBy="categoryId" 
          :canBeDone="true" 
          filter="undone"
          :hideSupermercado="true" 
          :productList="productosVisibles" 
          :selected="true" 
          :supermercado="id_supermercado || 0" 
          @click="handleShoplistClick" 
          />
      </div>
      <div v-show="(productosVisibles.some(item=>item.done))">
        <div class="w-100 text-center">Ya comprado<hr /></div>
        <MyProductList 
          orderBy="categoryId" 
          :canBeDone="true" 
          :productList="productosVisibles" 
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
  import { ref, defineProps, computed, watch,onMounted } from 'vue';
  import { findIndexById }            from '@/utilidades'

  const props=defineProps({
    modelValue: {type:Object, required:true},
    supermercados:{type:Object,required:true},
    alturaDisponible:{type:Number,required:true},
    active:{type:Boolean,required:true}
  })
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
  const productsData=ref(props.modelValue)
  const productosVisibles=computed(()=>productsData.value.filter(item=>item.selected))
  const handleShoplistClick=item=>{
    productsData.value[findIndexById(item.id,productsData.value)].done=!productsData.value[findIndexById(item.id,productsData.value)].done
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
        });      
      }
</script>
<style scoped>
</style>