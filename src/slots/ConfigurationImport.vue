<template>
  <MyFile 
    text="Importar Configuración" 
    btnClass="primary bold" 
    @fileReaded="handleFileReaded" 
    @fileReadError="handeFileReadError" 
    :maxFileSize="maxFileSize" 
    accept="application/json" 
  />
</template>

<script setup>
  import MyFile from '@components/MyFile.vue';
  import Swal   from 'sweetalert2';
import { useStore } from 'vuex';

  const store=useStore()
  const storeGet=store.getters

  const props=defineProps({ 
    showInternalSwalError:  { type:Boolean, default:true      },
    maxFileSize:            { type:Number,  default:100*1024  },
  })
  const emit=defineEmits(['configurationFileReaded','configurationFileError'])
  
  const handleFileReaded= data => (data.appName!=storeGet.getAppName())?emit('configurationFileError','ERROR_APPNAME'):emit('configurationFileReaded',data)

  const handeFileReadError= error => {
    if (props.showInternalSwalError) {
      let title="Atención"
      let html="El archivo de configuración seleccionado<br>no es un archivo de configuración<br>de «Hungry!» válido o está dañado"
      error === "ERROR_APPNAME" && ((title = "ERROR INESPERADO"), (html = error));
      Swal.fire({
        icon:'error',
        title,
        html,
        confirmButtonText:'Aceptar',
        target: document.querySelector("#appContainer"),
      })
    }
    emit('configurationFileError',error)
  }
</script>
<style scoped>
</style>