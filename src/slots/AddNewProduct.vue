<template> <!-- Add new product -->
  <MyCard
  borderStyle="rounded-bottom"
  >
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
    :maxLength="realMaxLength" 
    @keyPressed:enter="handleAddClick" 
    :id="id"
    @blur="handleBlur"
    />
    <MyButton 
    text="Añadir" 
    @click="handleAddClick" 
    />
  </MyCard>
</template>  

<script setup>
  import MyCard from '@/components/MyCard.vue'
  import MySelect                           from '@components/MySelect.vue'
  import MyCategoriesList                   from '@components/MyCategoriesList.vue'
  import Swal                               from 'sweetalert2'
  import MyInput                            from '@components/MyInput.vue'
  import MyButton                           from '@components/MyButton.vue'
  import { ref }  from 'vue';
  import { useStore } from 'vuex'
  import { generateID } from '@/utilidades'

  const id = `'inputAddNewProduct-${generateID()}`;
  const store=useStore()
  const storeGet=store.getters

  const props=defineProps({ 
    categoriesData:   { type: Array,    required: true      }, 
    supermercados:    { type: Array,    required: true      },
    maxLenght:        { type: Number,   default:  Infinity  },
    defaultMaxLength: { type: Boolean,  defaul:   false     },
  })
  const realMaxLength=ref(props.maxLenght)
  if (props.defaultMaxLength) realMaxLength.value=storeGet.getMaxLenght();
  const handleBlur=(event)=>emit('blur',event)

  const nuevoProducto=ref("")
  const focusInput = input => { input.focus(); input.setSelectionRange(input.value.length,input.value.length) }
  const categoriaActiva= ref(props.categoriesData[0])
  const supermercadoActivo=ref(props.supermercados[0])
  const handleCategoryLongClick=categoria=>{
    Swal.fire({
      title: `Cambiar Nombre de Categoría<br> «${categoria?.text}»`,
      html: ` <label for="inputModifyCategory">Introduzca un nuevo nombre para la categoría</label>
              <input type="text" class="swal2-input" id="inputModifyCategory" maxlenght="${realMaxLength.value}" value="${categoria.text}">
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
    }).then(() => {
      emit('blur')
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
  const emit =defineEmits(['categoryChanged','addClick','update:modelValue','blur'])
  defineExpose({clearInput})
</script>
<style scoped>
</style>