<template>
  <div class="container mt-5">
    <h1 class="mb-4 text-center">Hungry!<MyImageLoader :image="'hungry.svg'" :className="'logo'" /></h1>
    <MyTab :tabs="tabsData" :defaultActive="defaultTabActive" @tabHeightChanged="handleTabHeightChanged" :alturaDisponible="alturaDisponible" >
      <template v-slot:tabContent0> <!-- Configuration -->
        <MyCard>
          <p>Selecciona qué configuración deseas exportar:</p>
          <MyCheckbox v-for="index in [0,1]" :key="index" :value="index" :label="CONFIG_NAMES[index]" v-model:checkedValues="configs2Export" :group="'configs2Export'" @lastCheckedDeletionAttempt="handleConfigLastCheckedDeletionAttempt" @update:checkedValues="handleUpdateConfigCheckedValues" />
          <br>
          <MyButton :text="'Exportar Configuración Seleccionada'" @click="exportConfig" />
        </MyCard>
        <MyCard :borderStyle="'rounded-bottom'">
          <MyFileReader :text="'Importar Configuración'" @fileReaded="handleFileReaded" @fileReadError="handeFileReadError" :maxFileSize="20*1024" :accept="'application/json'"/>
        </MyCard>
      </template>
      <template v-slot:tabContent1> <!-- Add new product -->
        <MyCategoriesList :categories="categoriesData" @categorySelected="handleCategorySelected" @categoryLongClick="handleCategoryLongClick" />
        <MySelect :options="supermercados" v-model="supermercado" selectName="supermercado" @select="handleSelect" />
        <MyInput v-model="nuevoProducto" :placeholder="'Añade elementos aquí'" :autofocus="true" />
        <MyButton text="Añadir" @click="handleAddClick" />
      </template>    
      
      <template v-slot:tabContent2> <!-- orderBy name -->
        <MyCard :min-height="alturaDisponible" :heightModifier="-152" :borderStyle="'rounded-bottom'">
          <MyProductList 
            :productList="productsData" 
            orderBy="name"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </MyCard>
      </template>
      
      <template v-slot:tabContent3> <!-- orderBy categoryId,name -->
        <MyCard :min-height="alturaDisponible" :heightModifier="-152" :borderStyle="'rounded-bottom'">
          <MyProductList 
            :productList="productsData" 
            orderBy="categoryId"
            @click:product="handleClickProduct"
            @longClick:product="handeLongClickProduct"
          />
        </MyCard>
      </template>

      <template v-slot:tabContent4> <!-- Shopping List -->
        <MySelect :options="supermercados" selectName="supermercado" @select="handleSelect" :selectedValue="-1" />
        <MyCard :min-height="alturaDisponible" :heightModifier="-202" :borderStyle="'rounded-bottom'">
          <MyProductList :productList="productsData" orderBy="categoryId" :selected="true" :canBeDone="true" @click:product="handleShoplistClick" />
        </MyCard>
      </template>
    </MyTab>
  </div>
</template>

<script>
import { localStorageService }  from './localStorageService.js';
import MyCard                   from './components/MyCard.vue';
import MyCategoriesList         from './components/MyCategoriesList.vue';
import MyCheckbox               from './components/MyCheckbox.vue';
import MyTab                    from './components/MyTab.vue';
import MyInput                  from './components/MyInput.vue';
import MyButton                 from './components/MyButton.vue';
import MySelect                 from './components/MySelect.vue';
import MyProductList            from './components/MyProductList.vue';
import MyImageLoader            from './components/MyImageLoader.vue';
import MyFileReader             from './components/MyFile.vue';
import { ref, createApp }       from 'vue';
import { useStore }             from 'vuex';
import Swal                     from 'sweetalert2';

const LOCAL_STORAGE_KEYS = ['categoriesData','productsData'];
const INDEX_CATEGORIAS=0;
const INDEX_PRODUCTOS=1;

function downloadJSON(obj, filename = 'hungry.json') {
  const json = JSON.stringify(obj); // Convertir el objeto a formato JSON
  const blob = new Blob([json], { type:'application/json'}); // Crear un objeto Blob con el contenido JSON
  const link = document.createElement('a'); // Crear un enlace <a> para descargar el archivo
  link.href = URL.createObjectURL(blob);
  link.download = filename; // Establecer el nombre de archivo
  link.style.display= 'none'; // Ocultar el enlace y agregarlo al cuerpo del documento
  document.body.appendChild(link);
  link.click(); // Simular un clic en el enlace para iniciar la descarga
  document.body.removeChild(link); // Limpiar el enlace y el objeto Blob
  URL.revokeObjectURL(link.href);
}

export default {
  name:'App',
  components:{
    MyButton,
    MyCard,
    MyCategoriesList,
    MyCheckbox,
    MyFileReader,
    MyImageLoader,
    MyInput,
    MyProductList,
    MySelect,
    MyTab,
  },
  data(){
    return{
      categoria:this.categoriesData[0].text,
      id_categoria:this.categoriesData[0].id,
      id_supermercado:-1,
      inputText:'',
      nuevoProducto:'', // Inicializa nuevoProducto con el valor deseado
      supermercado:'',
      configs2Export:[],
      defaultTabActive:1,
      alturaDisponible:0,
      productoSeleccionado:{}
    }
  },
  methods:{
    findIndex(what,where){return where.findIndex(item => item === what)},
    findProductIndex(product){this.findIndex(product,this.productsData)},
    findCategoryIndex(category){this.findIndex(category,this.categoriesData)},
    setAndSave(where,what)
    {
      if(where==LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS]) this.categoriesData=what
      else if(where==LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS]) this.productsData=what
      localStorageService.setItem(where, what);
    },
    exportConfig(){
      if (this.configs2Export.length==0)
        return Swal.fire({
          icon:'error',
          title:'Error',
          html:"Debe seleccionar al menos<br>una configuración a exportar",
          confirmButtonText:'Aceptar'
        })
      downloadJSON({name:'Hungry!',categorias:this.categoriesData,productos:this.productsData})
    },
    handleEditarProducto(){
      const vm = createApp(MyCategoriesList, {
        categories: this.categoriesData // Pasar las propiedades necesarias al componente
      }).mount(document.createElement('div')); // Montar el componente Vue en un div creado dinámicamente
      const htmlContent = vm.$el.outerHTML; 
      console.log(htmlContent);
      Swal.fire({
        title: 'Seleccionar categoría',
        html: htmlContent,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Acción a realizar si se confirma el SweetAlert2
          // this.handleCategorySelectedEditProduct(vm.$props.selectedCategory); // Llama a la función con la categoría seleccionada
        }
      });
    },
    handleEliminarProducto(){
      Swal.fire({
        title: '¿Estás seguro de que quieres eliminar el producto?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        customClass: {
          cancelButton: 'btn btn-success', // Clase CSS para el botón de confirmación (Sí)
          confirmButton: 'btn btn-danger' // Clase CSS para el botón de cancelación (No)
        }
      }).then((result) => {
        if (result.isConfirmed) {
          let index=this.findProductIndex(this.productoSeleccionado)
          this.productsData.splice(index, 1)
          localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS],this.productsData)
          this.productoSeleccionado=null;
          this.$refs.myModalSlotRef.closeModal();

        }
      });
    },
    handleShoplistClick(product)
    {
      let index=this.findProductIndex(product)
      this.productsData[index].done=!this.productsData[index].done
    },
    handleClickProduct(product){
      let index=this.findProductIndex(product)
      this.productsData[index].selected=!this.productsData[index].selected
      this.productsData[index].done=false
    },
    handeLongClickProduct(product){
      this.productoSeleccionado=product;
      Swal.fire({
        title: product.text,
        text: '¿Qué desea hacer?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Editar Producto',
        cancelButtonText: 'Eliminar Producto',
        customClass: {
          confirmButton: 'btn btn-success', // Clase CSS para el botón de confirmación (Sí)
          cancelButton: 'btn btn-danger' // Clase CSS para el botón de cancelación (No)
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.handleEditarProducto()
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.handleEliminarProducto()
        }
      });

    },
    handleTabHeightChanged(data){
      this.alturaDisponible=data;
    },
    handleUpdateConfigCheckedValues(data){
      console.log(data);    },
    handleConfigLastCheckedDeletionAttempt(){
        Swal.fire({
          icon:'error',
          title:'Error',
          html:"Debe seleccionar al menos<br>una configuración a exportar",
          confirmButtonText:'Aceptar'
        })
    },
    handleFileReaded(data){
      if (data.name!="Hungry!")
        return Swal.fire({
          icon:'error',
          title:'Error',
          html:"El archivo de configuración<br>no parece ser válido o está dañado",
          confirmButtonText:'Aceptar'
        })
      if (data.categorias)  this.setAndSave(LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS], data.categorias);
      if (data.productos) this.setAndSave(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS], data.productos);
        Swal.fire({
          icon:'success',
          title:'Atención',
          html:"Archivo de configuración<br>importado correctamente",
          confirmButtonText:'Aceptar'
        })
    },
    handeFileReadError(error){
        Swal.fire({
          icon:'error',
          title:'Error',
          html:error,
          confirmButtonText:'Aceptar'
        })
        return false;
    },
    handleCategorySelected(category,index) {
      this.categoria = category;
      this.id_categoria= index;
      this.nuevoProducto = '';
    },
    handleCategoryLongClick() {
      Swal.fire({
        title: `Cambiar «${this.categoria?.text}»`,
        text: 'Introduzca un nuevo nombre para la categoría',
        input: 'text',
        inputValue: this.categoria.text,
        showCancelButton: true,
        confirmButtonText: 'Guardar cambios',
        cancelButtonText: 'Cancelar',
        customClass: {
          cancelButton: 'btn btn-success', // Clase CSS para el botón de confirmación (Sí)
          confirmButton: 'btn btn-info' // Clase CSS para el botón de cancelación (No)
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const newText = result.value;
          this.categoriesData[this.id_categoria].text = newText;
          localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_CATEGORIAS], this.categoriesData);
        }
      });
    },
    handleAddClick(){
      if (this.nuevoProducto==='')
      {
        Swal.fire({
          icon:'error',
          title:'Error',
          text:'Debes introducir un nombre para el nuevo producto',
          confirmButtonText:'Aceptar'
        })
        return false;
      }
      if (this.id_supermercado<0)
      {
        Swal.fire({
          icon:'error',
          title:'Error',
          text:'Debes seleccionar qué supermercado asignarás a '+ this.nuevoProducto,
          confirmButtonText:'Aceptar'
        })
        return false;
      }
      this.productsData.push({id:this.productsData.length,text:this.nuevoProducto,categoria:this.categoriesData[this.id_categoria],id_categoria:this.id_categoria,supermercado:this.supermercados[this.id_supermercado],id_supermercado:this.id_supermercado});
      this.nuevoProducto="";
      localStorageService.setItem(LOCAL_STORAGE_KEYS[INDEX_PRODUCTOS],this.productsData);
    },
    handleSelect(selected,index)
    {
      this.supermercado=selected.text;
      this.id_supermercado=index;
    }
  },
  setup() {
      document.title="Hungry! by trystan4861"; //forzamos el nombre para evitar que netlify ponga el que le de la gana

      const store=useStore();
      const storeGet=store.getters;

      const initialData=[storeGet.getCategorias,[]]
      const CONFIG_NAMES = storeGet.getConfigNames();
      const tabsData= storeGet.getTabs();

      const productsData=ref(getDataFromLocalStorage(INDEX_PRODUCTOS));
      const categoriesData = ref(getDataFromLocalStorage(INDEX_CATEGORIAS));
   
      function getDataFromLocalStorage(index=0) {
          const storedData = localStorageService.getItem(LOCAL_STORAGE_KEYS[index]);
          return (storedData)?storedData:localStorageService.setItem(LOCAL_STORAGE_KEYS[index], initialData[index]);
        }

      const supermercados=ref([
        {text:'Cualquier Supermercado', logo:'hungry.svg'},
        {text:'Carrefour', logo:'carrefour.svg'},
        {text:'Mercadona', logo:'mercadona.svg'},
        {text:'La Carmela', logo:'super_carmela.svg'},
      ])
      //const selectedSupermercado = ref('');
      return {
        CONFIG_NAMES,
        tabsData, 
        productsData,
        categoriesData,
        supermercados, 
      }
  },
  mounted(){
    setTimeout(this.nuevoProductoFocus,500);
  }
};
</script>

<style>
html,body
{
  --bs-body-bg:black;
  --bs-body-color:white;
  display: flex;
  flex-direction: column;
  height: 100vh; /* 100% de la altura de la ventana */
  margin: 0; /* Eliminar el margen predeterminado del body */
  padding: 0; /* Eliminar el padding predeterminado del body */
  overflow: hidden;
}
#app{
  height: 100%!important;
}
.container {
  height: 100%;
  flex-grow: 1; /* Esto hará que .container se expanda */
  display: flex;
  flex-direction: column;
}
.tabs-container{
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Esto hace que el contenido se expanda */
  overflow-y: auto; /* Para permitir el desplazamiento si el contenido excede la altura disponible */
  scrollbar-width: thin;
  scrollbar-color: #888 #f0f0f0;
}
.tabs-container::-webkit-scrollbar{
  width: 5px;
}
.tabs-container::-webkit-scrollbar-track{
  background: #f0f0f0;
}
.tabs-container::-webkit-scrollbar-thumb{
  background: #888;
}
.logo{
  width:60px;
}
</style>