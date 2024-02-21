<template>
  <div class="file-select">
    <input type="file" @change="handleFileChange" id="MyFile" :accept="accept">
    <label class="btn btn-primary" for="MyFile">Importar Configuración</label>
  </div>
</template>

<script>

export default {
  name: 'MyFileReader',
  props:{
    maxFileSize: {
      type: Number,
      default: null
    },
    fileName: {
      type: String,
      default:''
    },
    accept:{
      type: String,
      default: "*.*"
    }
  },
  setup(props, {emit}) {
    const handleFileChange = async (event) => {
      if (props.fileName!='') if (event.target.files[0].name.toLowerCase()!=props.fileName) return emit('fileReadError',`Nombre de archivo erróneo,<br>se esperaba «${props.fileName}»`)
      if (props.maxFileSize!=null) if (event.target.files[0].size>props.maxFileSize)  return emit('fileReadError',`Archivo demasiado grande,<br>tamaño máximo ${props.maxFileSize/1024}KB`)
      try {
        emit('fileReaded', await readFile(event.target.files[0]));
        event.target.value='';
      } catch (err) {
        emit('fileReadError',err.message);
      }
    };

    const readFile = (inputFile) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) =>{
        try {  
            const json = JSON.parse(event.target.result); 
            resolve(json)
          } catch (e) {  
            reject("El archivo a importar debe ser un archivo de configuración de Hungry! válido")
          }
        }
        reader.onerror = (event) =>reject(event.target.error);
        reader.readAsText(inputFile);
      });

    return {
      handleFileChange,
    };
  },
  emits: ['fileReaded','fileReadError']
};
</script>

<style>
.file-select{
  position: relative;
  display: inline-flex;
  cursor: pointer;
  width: 100%;
  height: 3.125rem;
  justify-content: center;
  align-content: center;
}
.file-select input[type="file"] {
  display: none;
}
.file-select label{
  width: 100%;
  height: 100%;
  padding-top: .625rem;  
}
/* Estilos opcionales para el componente */
</style>
