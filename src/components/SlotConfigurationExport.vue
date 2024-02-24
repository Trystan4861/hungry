<template>
  <p>Selecciona qué configuración deseas exportar:</p>
  <MyCheckbox v-for="index in [0,1]" :key="index" :value="configNames[index]" :label="configNames[index]" v-model:checkedValues="configs2Export" @lastCheckedDeletionAttempt="handleConfigLastCheckedDeletionAttempt" @update:checkedValues="handleUpdateConfigCheckedValues" />
  <br>
  <MyButton :text="'Exportar Configuración Seleccionada'" @click="exportConfig" />
</template>

<script>
  import MyCheckbox from './MyCheckbox.vue'; // Importa el subcomponente MyCheckbox
  import MyButton   from './MyButton.vue'; // Importa el subcomponente MyButton
  import Swal       from 'sweetalert2';
  import { useStore } from 'vuex';
  import { ref } from 'vue';

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
    name:'SlotConfigurationExport',
    props:{
      configNames:{ type: Array, required: true }
    },
    components: {
      MyCheckbox,
      MyButton
    },
    setup(){
      const store=useStore().getters;
      const configs2Export=ref([])
      const handleUpdateConfigCheckedValues=(data)=>{console.log(data);}
      const handleConfigLastCheckedDeletionAttempt=()=>{
          Swal.fire({
            icon:'error',
            title:'Error',
            html:"Debe seleccionar al menos<br>una configuración a exportar",
            confirmButtonText:'Aceptar'
          })
      }
      const exportConfig=()=>{
        if (configs2Export.value.length==0)
          return Swal.fire({
            icon:'error',
            title:'Error',
            html:"Debe seleccionar al menos<br>una configuración a exportar",
            confirmButtonText:'Aceptar'
          })
        let toDownload={appName:'Hungry!'}
          
        if (configs2Export.value.includes('Categorías'))
          toDownload.categorias=store.getCategorias()
        if (configs2Export.value.includes('Productos'))
          toDownload.productos=store.getProductos()

        downloadJSON(toDownload)
      };
      return {
        handleUpdateConfigCheckedValues,
        handleConfigLastCheckedDeletionAttempt,
        exportConfig,
        configs2Export
      }
    }
  };
</script>
