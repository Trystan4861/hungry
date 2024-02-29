<template>
  <MyFile :text="'Importar Configuración'" @fileReaded="handleFileReaded" @fileReadError="handeFileReadError" :maxFileSize="100*1024" :accept="'application/json'" />
</template>

<script>
import MyFile from './MyFile.vue'; // Importa el subcomponente MyFileReader

export default {
  name: "SlotConfigurationImport",
  components: {
    MyFile // Declara el subcomponente MyFileReader
  },
  setup(props,{emit}){
    const handleFileReaded=(data)=>{
      if (data.appName!="Hungry!") return emit('configurationFileError','ERROR_APPNAME')
      emit('configurationFileReaded',data)
    }
    const handeFileReadError=(error)=>{
      emit('configurationFileError',error)
    }
    return {
      handleFileReaded,
      handeFileReadError,
    }

  },
  emits:['configurationFileReaded','configurationFileError']
};
</script>