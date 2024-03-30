<template>
  <my-file :text="'Importar Configuración'" @fileReaded="handleFileReaded" @fileReadError="handeFileReadError" :maxFileSize="100*1024" :accept="'application/json'" />
</template>

<script setup>
import MyFile from '@/components/MyFile.vue'; // Importa el subcomponente MyFileReader
import { defineEmits } from 'vue';
    const handleFileReaded=(data)=>{
      if (data.appName!="Hungry!") return emit('configurationFileError','ERROR_APPNAME')
      emit('configurationFileReaded',data)
    }
    const handeFileReadError=(error)=>{
      emit('configurationFileError',error)
    }
  const emit=defineEmits(['configurationFileReaded','configurationFileError'])
</script>