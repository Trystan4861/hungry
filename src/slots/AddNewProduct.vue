<template> <!-- Add new product -->
    <MyCategoriesList class="mb-4" 
      :categories="props.categoriesData" 
      @categoryLongClick="handleCategoryLongClick" 
      @categorySelected="handleCategorySelected" 
      />
    <MySelect 
      placeholder="Selecciona un supermercado" 
      :options="props.supermercados" 
      :selected="props.supermercados[0]" 
      @select="handleSelectSupermercado" 
      />
    <MyInput 
      class="mb-4" 
      placeholder="Introducir nombre de producto" 
      v-model="nuevoProducto" 
      :autofocus="true" 
      :maxLength="props.maxLenght" 
      @keyPressed:enter="handleAddClick" 
      :id="id"
      />
    <MyButton 
      text="Añadir" 
      @click="handleAddClick" 
      />
</template>  

<script setup>
  import MySelect                           from '@components/MySelect.vue'
  import MyCategoriesList                   from '@components/MyCategoriesList.vue'
  import Swal                               from 'sweetalert2'
  import MyInput                            from '@components/MyInput.vue'
  import MyButton                           from '@components/MyButton.vue'
  import { ref, defineProps, defineEmits, defineExpose }  from 'vue';

  const id = `'inputAddNewProduct-${Math.random().toString(36).slice(2)}`;

  const props=defineProps({ 
    categoriesData: { type: Array,  required: true    }, 
    supermercados:  { type: Array,  required: true    },
    maxLenght:      { type: Number, default:  Infinity}
  })
  const nuevoProducto=ref("")
  const focusInput = input => { input.focus(); input.setSelectionRange(input.value.length,input.value.length) }
  const categoriaActiva= ref(props.categoriesData[0])
  const supermercadoActivo=ref(props.supermercados[0])
  const handleCategoryLongClick=categoria=>{
    Swal.fire({
      title: `Cambiar Nombre de Categoría<br> «${categoria?.text}»`,
      html: ` <label for="inputModifyCategory">Introduzca un nuevo nombre para la categoría</label>
              <input type="text" class="swal2-input" id="inputModifyCategory" maxlenght="${props.maxLenght}" value="${categoria.text}">
      `,
      target: document.querySelector("#appContainer"),
      didOpen: ()=>{
        setTimeout(()=>{
          focusInput(document.querySelector("#inputModifyCategory"))
        },50)
      },
      preConfirm: ()=>{
        return new Promise((resolve)=>{
            resolve({value: document.querySelector("#inputModifyCategory").value})
        }).then((result)=>{
          emit ('categoryChanged', categoria.id,result.value)
        })
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText: 'Cancelar',
    });
  }
  const handleCategorySelected=category=>categoriaActiva.value = category;
  const handleSelectSupermercado=selected=>supermercadoActivo.value=selected 
  const clearInput=()=>nuevoProducto.value=''
  const handleAddClick=()=>{
    if (nuevoProducto.value==''){
      Swal.fire({
        icon:'error',
        title:'Error',
        text:'Debes introducir un nombre para el nuevo producto',
        confirmButtonText:'Aceptar',
        target: document.querySelector("#appContainer"),
      })
    }
    else
      emit('addClick',nuevoProducto.value,categoriaActiva.value.id,supermercadoActivo.value.id)
  }
  const emit =defineEmits(['categoryChanged','addClick','update:modelValue'])
  defineExpose({clearInput})
</script>
<style scoped>
  @import url('@css/SlotAddNewProduct.vue.css');
</style>