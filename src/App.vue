<template>
  <div id="appContainer" class="container mt-4" @click="setFullScreen">
    <my-tab 
      :defaultActive    ="tabActiva" 
      :tabs             ="tabsData" 
      @tabChanged="handleUpdateTabActive" 
      ref="myTabRef"
    >
      <template v-slot:tabContent0> <!-- Configuration -->
        <SlotConfigurationTab />
      </template>
      <template v-slot:tabContent1> <!-- Add new product -->
        <SlotAddNewProduct 
          ref               = "slotAddNewProductRef"
          :supermercados    = "supermarketsData" 
          :defaultMaxLength = "true"
          @categoryChanged  = "handleAddNewProductCategoryChanged" 
          @click            = "haddleAddNewProductClick"
          @blur             = "handleAddNewProductBlur"
          />
      </template>    
      <template v-slot:tabContent2> 
        <SlotProductsList orderBy = "name" />
      </template>
      <template v-slot:tabContent3> 
        <SlotProductsList orderBy = "categoryId" />
      </template>
      <template v-slot:tabContent4>
        <SlotShoppingList :active = "tabActiva==4" />
      </template>
    </my-tab>
  </div>
  <notifications group="pwa" position="top center" width="50%"  />
  <notifications group="app" position="bottom center" width="50%"  />
</template>

<script setup>
  import { localStorageService }                  from '@/localStorageService'
  import MyTab                                    from '@components/MyTab.vue'

  import SlotProductsList                         from '@slots/ProductsList.vue'
  import SlotConfigurationTab                     from '@slots/ConfigurationTab.vue'
  import SlotAddNewProduct                        from '@slots/AddNewProduct.vue'
  import SlotShoppingList                         from '@slots/ShoppingList.vue'

  import Swal                                     from 'sweetalert2'
  import { ref, watch, onMounted, onBeforeMount } from 'vue'
  import { useStore }                             from 'vuex'
  //import axios                        from 'axios'
  import { notify,Notifications }                 from '@kyvg/vue3-notification'
  import { DID, _DOM, getDataFromLocalStorage }              from '@/utilidades'
  
  const store                   = useStore()
  const storeGet                = store.getters

  const slotAddNewProductRef    = ref(null)
  const tabsData                = storeGet.getTabs()
  const supermarketsData        = storeGet.getSupermercados()
  const productsData            = ref(getDataFromLocalStorage(store,'productos'       ))
  const categoriesData          = ref(getDataFromLocalStorage(store,'categorias'      ))
  const tabActiva               = ref(getDataFromLocalStorage(store,'defaultTabActive'))
  const myTabRef                = ref(null)
  typeof categoriesData.value==='undefined'  && (categoriesData.value=storeGet.getCategorias())

  const handleUpdateTabActive               = tab=>tabActiva.value=tab
  
   const handleAddNewProductCategoryChanged   = (id_categoria,text) =>{
    categoriesData.value[id_categoria].text=text
    categoriesData.value=[...categoriesData.value]
  }
  const setFullScreen           = () => {
    if (!storeGet.getFullScreen()) return document.fullscreenElement?document.exitFullscreen():null
    if (document.fullscreenElement) return
    const    elemento=DID("appContainer");
    if      (elemento.requestFullscreen       ) elemento.requestFullscreen()
    else if (elemento.mozRequestFullScreen    ) elemento.mozRequestFullScreen()
    else if (elemento.webkitRequestFullscreen ) elemento.webkitRequestFullscreen()
    else if (elemento.msRequestFullscreen     ) elemento.msRequestFullscreen()
  }
  const haddleAddNewProductClick= (nuevoProducto,id_categoria,id_supermercado)=>{
    if (!productsData.value.some(producto => producto.text.toLowerCase() === nuevoProducto.toLowerCase())){
      productsData.value.push({
        id: productsData.value.length?productsData.value[productsData.value.length - 1].id+1:1,
        text:nuevoProducto,
        amount: 1,
        id_categoria:id_categoria,
        id_supermercado:id_supermercado
      });
      notify({group:"app", text:`Producto «${nuevoProducto}» añadido correctamente en ${categoriesData.value[id_categoria].text} para poder comprarlo en ${supermarketsData[id_supermercado].text}`,type:"success", duration:3000})
      productsData.value=[...productsData.value]
      slotAddNewProductRef.value.clearInput()
    }
    else
      Swal.fire({
        icon:'warning',
        title: 'Atención',
        html: `Ya existe un producto llamado<br>«${nuevoProducto}»`,
        target: _DOM("#appContainer"),
    })
  }

  const handleAddNewProductBlur=()=>myTabRef.value.getAvailHeight() //para lidiar con el comportamiento anómalo en algunos navegadores al mostrarse y ocultarse el teclado virtual
  
  watch(productsData,   newData => store.dispatch('setProductos',   localStorageService.setSubItem('productos',   newData)));
  watch(categoriesData, newData => store.dispatch('setCategorias',  localStorageService.setSubItem('categorias',  newData)));
  watch(()=>storeGet.getProductos(),newData=>productsData.value=newData)
  watch(()=>storeGet.getCategorias(),newData=>categoriesData.value=newData)

  onBeforeMount(()=>getDataFromLocalStorage(store,'state')) // actualizamos el store desde el localStorage si existe
  onMounted(()=>{
    document.store=store
    document.addEventListener('contextmenu', event => event.preventDefault())

    // Agregamos un event listener a al docmuemento para habilitar el mostrar/ocultar contraseña según sea necesario
    document.addEventListener('click', function(event) {
      // Verificamos si el elemento que desencadenó el evento tiene la clase toggle-password
      if (event.target.classList.contains('toggle-password')) {
        // obtenemos el campo de tipo contraseña
        const passwordInput = event.target.closest('.input-group').querySelector('.password-input');
        // intercambiamos el tipo y el icono asociado al input
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          event.target.innerHTML = '&#x1f513;&#xfe0e;'; // Icono de ojo abierto
        } else {
          passwordInput.type = 'password';
          event.target.innerHTML = '&#x1f512;&#xfe0e;'; // Icono de ojo cerrado
        }
      }
    });
  })
</script>

<style>
  @import url('@css/App.vue.css');
</style>