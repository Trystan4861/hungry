<template>
  <div id="appContainer" class="container mt-4" @click="setFullScreen">
    <my-tab 
      :defaultActive    ="tabActiva" 
      :tabs             ="tabsData" 
      @tabChanged="handleUpdateTabActive" 
      ref="myTabRef"
    >
      <template v-slot:tabContent0> <!-- Configuration -->
        <SlotConfigurationTab 
          @categoriasVisibilesChanged="handlecategoriasVisibilesChanged" 
        />
      </template>
      <template v-slot:tabContent1> <!-- Add new product -->
        <slot-add-new-product 
          ref               = "slotAddNewProductRef"
          :categoriesData   = "categoriesData" 
          :supermercados    = "supermarketsData" 
          :defaultMaxLength = "true"
          @categoryChanged  = "handleCategoryChanged" 
          @addClick         = "haddleAddNewProductClick"
          @blur             = "handleBlur"
          />
      </template>    
      <template v-slot:tabContent2> <!-- orderBy name -->
        <slotProductsList 
          orderBy           = "name" 
        />
      </template>
      <template v-slot:tabContent3> <!-- orderBy categoryId,name -->
        <slotProductsList 
          orderBy           = "categoryId" 
        />
      </template>
      <template v-slot:tabContent4> <!-- Shopping List -->
        <slotShoppingList 
          :active           = "tabActiva==4" 
        />
      </template>
    </my-tab>
  </div>
  <notifications group="pwa" position="top center" width="50%"  />
  <notifications group="app" position="bottom center" width="50%"  />
</template>

<script setup>
  import { localStorageService }              from '@/localStorageService'
  import MyTab                                from '@components/MyTab.vue'

  import SlotProductsList                   from '@slots/ProductsList.vue'
  import SlotConfigurationTab                 from '@slots/ConfigurationTab.vue'
  import SlotAddNewProduct                    from '@slots/AddNewProduct.vue'
  import slotShoppingList                     from '@slots/ShoppingList.vue'

  import Swal                                 from 'sweetalert2'
  import { ref, watch, onMounted }  from 'vue'
  import { useStore }                         from 'vuex'
  //import axios                        from 'axios'
  import { notify,Notifications }             from '@kyvg/vue3-notification'
  import { getDataFromLocalStorage }          from '@/utilidades'
  
  const store                   = useStore()
  const storeGet                = store.getters

  const slotAddNewProductRef    = ref(null)
  const tabsData                = storeGet.getTabs()
  const supermarketsData        = storeGet.getSupermercados()
  const productsData            = ref(getDataFromLocalStorage('productos'       ))
  const categoriesData          = ref(getDataFromLocalStorage('categorias'      ))
  const tabActiva               = ref(getDataFromLocalStorage('defaultTabActive'))
  const myTabRef                = ref(null)

  typeof categoriesData.value==='undefined'  && (categoriesData.value=storeGet.getConfiguration().categorias)

  const handleUpdateTabActive               = tab=>tabActiva.value=tab
  
  const handlecategoriasVisibilesChanged=(newCategoriesData)=>{
    categoriesData.value=newCategoriesData.value
  }

  const handleCategoryChanged   = (id_categoria,text) =>{
    categoriesData.value[id_categoria].text=text
    categoriesData.value=[...categoriesData.value]
  }
  const setFullScreen           = () => {
    if (!storeGet.getFullScreen()) return document.fullscreenElement?document.exitFullscreen():null
    if (document.fullscreenElement) return
    const    elemento=document.getElementById("appContainer");
    if      (elemento.requestFullscreen       ) elemento.requestFullscreen()
    else if (elemento.mozRequestFullScreen    ) elemento.mozRequestFullScreen()
    else if (elemento.webkitRequestFullscreen ) elemento.webkitRequestFullscreen()
    else if (elemento.msRequestFullscreen     ) elemento.msRequestFullscreen()
  }
  const haddleAddNewProductClick= (nuevoProducto,id_categoria,id_supermercado)=>{
    if (!productsData.value.some(producto => producto.text.toLowerCase() === nuevoProducto.toLowerCase())){
      productsData.value.push({
        id: productsData.value[productsData.value.length - 1].id+1,
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
        target: document.querySelector("#appContainer"),
    })
  }
    //TODO hacer el login
  //funcion para hacer llamada mediante axios
  /*async function doLogin() {
    let email="";
    let pass="";
    let urlbase = 'https://www.infoinnova.es/lolo/api';
    let data = { email,  pass };

    const response = await axios.post(urlbase + '/login', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    });
    console.log('Success:', response.data);
    return response.data;
  }*/

  const handleBlur=()=>myTabRef.value.getAvailHeight() //para lidiar con el comportamiento anómalo en algunos navegadores al mostrarse y ocultarse el teclado virtual

  watch(productsData,   newData => store.dispatch('setProductos',   localStorageService.setSubItem('productos',   newData)));
  watch(categoriesData, newData => store.dispatch('setCategorias',  localStorageService.setSubItem('categorias',  newData)));
  watch(()=>storeGet.getProductos(),newData=>productsData.value=newData)

  onMounted(()=>{
    document.addEventListener('contextmenu', event => event.preventDefault())
    typeof window.DOM  != 'function' && (window.DOM = (e,scope=document)=>scope.querySelector(e))
    typeof window._DOM != 'function' && (window._DOM= (e,scope=document)=>scope.querySelectorAll(e))
  })
</script>

<style>
  @import url('@css/App.vue.css');
</style>