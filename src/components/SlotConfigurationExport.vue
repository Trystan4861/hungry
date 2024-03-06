<template>
  <my-button :text="'Exportar Configuración'" @click="exportConfig" />
</template>

<script>
  import MyButton   from '@components/MyButton.vue'; // Importa el subcomponente MyButton
  import { useStore } from 'vuex';

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
    components: {
      MyButton
    },
    setup(){
        let store=useStore().getters
        const exportConfig=()=>downloadJSON(store.getConfiguration());
        return {exportConfig}
    }
  };
</script>
