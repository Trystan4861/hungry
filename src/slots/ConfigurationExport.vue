<template>
  <my-button :text="props.buttonText" :btnClass="props.btnClass" @click="exportConfig" />
</template>

<script setup>
  import MyButton from '@components/MyButton.vue'; // Importa el subcomponente MyButton
  import { useStore } from 'vuex';

  const props = defineProps({
    buttonText: { type: String, default: 'Exportar Configuración' },
    btnClass:   { type: String, default: 'success bold'           }
  })

  const downloadJSON=(obj, filename = 'hungry.json')=>{
    const json = JSON.stringify(obj); // Convertir el objeto a formato JSON
    const blob = new Blob([json], { type: 'application/json' }); // Crear un objeto Blob con el contenido JSON
    const link = document.createElement('a'); // Crear un enlace <a> para descargar el archivo
    link.href = URL.createObjectURL(blob);
    link.download = filename; // Establecer el nombre de archivo
    link.style.display = 'none'; // Ocultar el enlace y agregarlo al cuerpo del documento
    document.body.appendChild(link);
    link.click(); // Simular un clic en el enlace para iniciar la descarga
    URL.revokeObjectURL(link.href); // Limpiar el enlace y el objeto Blob
    document.body.removeChild(link); 
  }

  const store = useStore().getters;
  const config2Export=store.getConfiguracion(); // Obtiene la configuración del store
  config2Export.appName=store.getAppName() // Guarda el nombre de la aplicación en el archivo de configuración
  config2Export.loginData={email:'',token:''} //no se guardarán los datos de acceso al servidor en el archivo de configuración

  const exportConfig = () => downloadJSON(config2Export); // Exporta la configuración en formato JSON


  defineExpose({exportConfig})
</script>
<style scoped>
</style>
