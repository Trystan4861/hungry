<template>
  <my-card 
    borderStyle="rounded-bottom" 
    v-touch:drag.once="handleDragCard"
    >
    <div class="h-100" v-show="cantidadProductos==0">
        <div class="d-flex justify-content-center align-items-center h-100"><h2 class="text-uppercase text-center">No hay productos dados de alta</h2></div>
    </div> 
    <div v-show="cantidadProductos>0">
      <div class="d-flex justify-content-between">
        <div class="text-start">
          <MyButton v-if="!showFinder" btnClass="none" @click="showFinder=!showFinder">&#x1f50d;</MyButton>
          <MyInput 
            class="border-0" 
            style="height: 24px;" 
            :showClose="true" 
            :maxLength="20" 
            v-else 
            @click="handleFind" 
            placeholder="Buscar producto" 
            v-model="finder"></MyInput>
        </div>
        <div class="text-end">{{ amount2Buy }} producto{{ amount2Buy!=1?'s':'' }} seleccionado{{ amount2Buy!=1?'s':'' }}</div>
      </div>
      <div class="withScroll" ref="withScrollRef">
        <my-product-list 
        :orderBy="props.orderBy"
        :productList="productosFiltrados" 
        @click="handleClickProduct"
        @longClick="handeLongClickProduct"
        @drag="handleDrag"
        ref="productListRef"
        />
      </div>
    </div>
  </my-card>
  <div :id="id1" class="d-none">
    <div :id="id2">
      <my-categories-list 
        :selectCategory="productoSeleccionado?.id_categoria || 0" 
        :selected="itemCategorySelected"
        @categorySelected="handleCategorySelected" 
        class="swal"
        />
      <my-select 
        placeholder="Selecciona un supermercado" 
        ref="selectRef" 
        :options="supermarketsData" 
        :selected="supermercadoProducto || supermarketsData[0]"
        v-model="supermarketAtEdit"
        />
      <my-input ref="productoAEditarRef"
        v-model="productoAEditar" 
        :defaultMaxLength="true" 
        :placeholder="productoAEditar"
      />
    </div>
  </div>
  <div class="letraActual" :class="props.orderBy.toLowerCase()=='name'?'active':''" ref="letraActualRef"><span>{{ letraActual }}</span></div>
</template>
<script setup>
  
  import { ref, computed, watch, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import { createCopy, dispatch, findIndexById, generateID }                    from '@/utilidades'

  import Swal from 'sweetalert2';
  import MyCard from '@components/MyCard.vue'
  import MyProductList from '@components/MyProductList.vue';
  import MyInput from '@components/MyInput.vue';
  import MySelect from '@components/MySelect.vue';
  import MyCategoriesList from '@components/MyCategoriesList.vue';
  import { notify } from '@kyvg/vue3-notification';
  import { localStorageService } from '@/localStorageService';
  import MyButton from '@components/MyButton.vue';

  const id=generateID()
  const id1=`anchorEditarProducto-${id}`
  const id2=`divEditarProducto-${id}`
  const showFinder=ref(false)
  const props=defineProps({ orderBy:            { type: String, default: 'name' }, })
  
  const setProductsData =newData=>store.dispatch('setProductos',   localStorageService.setSubItem('productos',   newData))
  const handleDrag=()=>setProductsData(productsData.value)

  const finder                  = ref('')
  const store                   = useStore()
  const storeGet                = store.getters

  const controlY                = ref(-1)
  const ignoreLongClickTimeout  = ref(0)
  const itemCategorySelected    = ref(0)
  const letraActual             = ref('')
  const letraActualRef          = ref(null)
  const productoAEditar         = ref('')
  const productoAEditarRef      = ref(null)
  const productoSeleccionado    = ref(null)
  const selectRef               = ref(null)
  const supermarketAtEdit       = ref(null)
  const supermarketsData        = storeGet.getSupermercados()??storeGet.getInitialState('supermercados')
  const supermercadoProducto    = ref(null)
  const withScrollRef           = ref(null)
  const ocultaTooltipTimeout    = ref(0)
  const productListRef          = ref(null)
  
  const productsData            = computed(()=>storeGet.getProductos())
  const categoriesData          = computed(()=>storeGet.getCategorias())
  const categoriasVisiblesIds   = computed(()=>[...categoriesData.value.map(item=>({...item})).filter(item=>item.visible).map(item=>item.id)])
  const productosVisibles       = computed(()=>productsData.value.filter(producto => categoriasVisiblesIds.value.includes(producto.id_categoria)))
  const cantidadProductos       = computed(()=>productosVisibles.value.length)
  const amount2Buy              = computed(()=>productosVisibles.value.filter(i=>i.selected).length)

  const productosFiltrados      = computed(()=>productosVisibles.value.filter(i=>i.text.toLowerCase().includes(finder.value.toLowerCase())))

  const handleFind=()=>{
    finder.value=''
    showFinder.value=false
  }
  const handleCategorySelected=(category)=>{
    itemCategorySelected.value=category.id
  }
  const handleDragCard = event => {
    if (typeof event.touches==='undefined') return
    if (event.touches.length==0) return
    if (controlY.value<0) controlY.value=event.touches[0].clientY
    if (controlY.value-event.touches[0].clientY>10){
      if (!storeGet.getIgnoreDrag())
      {
        store.dispatch('setIgnoreDrag',true)
      }
    }
    clearTimeout(ignoreLongClickTimeout.value)
    ignoreLongClickTimeout.value=setTimeout(releaseIgnoreLongClick ,1000)
  }
  const releaseIgnoreLongClick= () => {
    controlY.value=-1
    store.dispatch('setIgnoreDrag',false)
  }
  const handleClickProduct      = product => {
    if (storeGet.getIgnoreDrag()) return
    let aux=[...productsData.value]
    let index=findIndexById(product.id,aux)
    aux[index].selected=(Object.prototype.hasOwnProperty.call(aux[index], 'selected'))?!aux[index].selected:true
    aux[index].done=false
    setProductsData(aux)
  }
  const handeLongClickProduct   = product => {
    if (storeGet.getIgnoreDrag()) return
    productoSeleccionado.value=product;
    Swal.fire({
      title: `«${product.text}»`,
      text: '¿Qué desea hacer?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Editar Producto',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-success mr-1 mb-2', 
        denyButton: 'btn btn-danger mb-2 mr-1',
        cancelButton: 'btn btn-primary mb-2',
      },
      buttonsStyling: false, 
      showDenyButton: true, 
      denyButtonText: 'Eliminar Producto', 
      target: document.querySelector("#appContainer"),
    }).then((result) => {
      if (result.isConfirmed) handleEditarProducto()
      else if (result.isDenied) handleEliminarProducto()
    });
  }
  const handleEditarProducto    = () =>{
    let aux=document.getElementById(id2);
    let producto=productoSeleccionado.value;
    productoAEditar.value=producto.text
    itemCategorySelected.value=producto.id_categoria
    supermarketAtEdit.value=supermarketsData[producto.id_supermercado]
    Swal.fire({
      title:              `Editar Producto<br>«${producto.text}»`,
      html:               '<div id="VueSweetAlert2"></div>',
      showCancelButton:   true,
      confirmButtonText:  'Confirmar',
      cancelButtonText:   'Cancelar',
      target:             document.querySelector("#appContainer"),
      willOpen: ()=>{
        supermercadoProducto.value=supermarketsData[producto.id_supermercado]
        document.getElementById('VueSweetAlert2').appendChild(aux);
      },
      willClose:()=>{document.getElementById(id1).appendChild(aux)}
    }).then((result) => {
      if (result.isConfirmed){
        const areTheSame=(a,b)=>(Object.keys(a).length!==Object.keys(b).length)?false:Object.keys(a).every(key => key in b && a[key] === b[key])
        let newData={
          id:producto.id,
          text:productoAEditar.value,
          id_categoria:itemCategorySelected.value,
          id_supermercado:selectRef.value.selectedOption.id,
          amount: 1,              
          selected: false,
          done: false,
        }
        if (!areTheSame(producto,newData)){
          let aux=createCopy(productsData.value)
          aux[findIndexById(newData.id, aux)] = newData;
          dispatch(store,'productos',aux)
          Swal.fire({
            title:'Atención',
            icon: 'success',
            text: 'Producto modificado correctamente',
            target: document.querySelector("#appContainer"),
          })
        }
        else {
          Swal.fire({
            title:'Atención',
            icon: 'info',
            text: 'No has realizado cambios al producto',
            target: document.querySelector("#appContainer"),
          })
        }
      }
    });
  }
  const handleEliminarProducto=()=>{
    Swal.fire({
      title: '¿Estás seguro de que quieres eliminar el producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-danger mb-2 mr-1', 
        cancelButton: 'btn btn-success mb-2', 
      },
      buttonsStyling: false, 
      target: document.querySelector("#appContainer"),
    }).then((result) => {
      if (result.isConfirmed){
        setProductsData(productsData.value.filter(item => item.id !== productoSeleccionado.value.id))
        notify({group:"app", text:`Producto «${productoSeleccionado.value.text}» eliminado correctamente`,type:"warn", duration:3000})
        productoSeleccionado.value=null;
      }
    });
  }
  const muestraOcultaTooltip=()=>letraActualRef.value.classList.toggle('show')
  const updateTooltip=()=>{
    const productos=withScrollRef.value.querySelectorAll(".productText")
    for (let producto of productos) {
      const pBCR = producto.getBoundingClientRect();
      const lBCR=letraActualRef.value.getBoundingClientRect();
      if (pBCR.top < lBCR.top) continue
      else if (pBCR.bottom <= lBCR.bottom)
        letraActual.value=producto.innerText[0].toUpperCase()
      else break
    }
    if (!letraActualRef.value.classList.contains("show"))
    {
        muestraOcultaTooltip()
        clearTimeout(ocultaTooltipTimeout.value)
        ocultaTooltipTimeout.value=setTimeout(muestraOcultaTooltip,1000)
    }
  }
  watch(productsData,   newData => storeGet.getProductos()!=newData && store.dispatch('setProductos',   localStorageService.setSubItem('productos',   newData)));
  watch(()=>storeGet.getProductos(),newData=>productsData.value!=newData && (productsData.value=newData))
  watch(()=>storeGet.getCategorias(),newData=>categoriesData.value!=newData && (categoriesData.value=newData))
  const setMaxHeight=maxHeight=>
  {
    withScrollRef.value?.style.setProperty('--height',`${maxHeight}px`)
  }
  onMounted(()=>{
      watch(()=>storeGet.getAlturaDisponible(), newValue=>setMaxHeight(newValue))
      setTimeout(()=>setMaxHeight(storeGet.getAlturaDisponible()),100)
      if (props.orderBy.toLowerCase()=="name")
        withScrollRef.value.addEventListener('scroll',updateTooltip,{passive:true})
  })
</script>
<style scoped>
.withScroll
{
  --height: auto;
  --height-modifier: 50px;
  overflow-y: auto;
  height: calc(var(--height,60px) - var(--height-modifier,0px) );
}
.letraActual{
  display: flex;
  opacity: 0;
  position: relative;
  bottom: 50%;
  left: 100%;
  margin-left: -30px;
  background-color: #ccc;
  color: #333;
  font-weight: bold;
  width: 10vmin;
  height: 10vmin;
  justify-content: center;
  align-items: center;
  translate: -100%;
  border-radius: 1cap;
  -webkit-box-shadow: 10px 10px 20px 0px rgba(0,0,0,0.75);
  -moz-box-shadow: 10px 10px 20px 0px rgba(0,0,0,0.75);
  box-shadow: 10px 10px 20px 0px rgba(0,0,0,0.75);
  transition: opacity 1s ease;
}
.letraActual:after{
    content: '';
    position: absolute;
    right: -10px;
    border-style: solid;
    border-width: 10px 0 10px 14px;
    border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) #ccc;
}
.letraActual span{
  font-size: 1.5625rem;
}
.active.show{
  opacity: 1
}
</style>