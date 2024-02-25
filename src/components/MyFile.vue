<template>
  <div>
    <input :id="inputID"  type="file" :accept="accept" @change="handleFileChange">
    <label :for="inputID" class="btn btn-primary">{{ text}}</label>
  </div>
</template>

<script>

export default {
  name: 'MyFileReader',
  props:{
    text:{ type: String, default: 'Seleccionar archivo' },
    maxFileSize: { type: Number, default: null },
    fileName: { validator: (value)=>value instanceof RegExp || typeof value === 'string', default: () => /^.*hungry.*\.json$/i },
    accept:{ type: String, default: "*.*" },
    forceFileName:{ type: Boolean, default: false }
  },
  data(){
    return {
      inputID: `input-${Math.random().toString(36).slice(2)}`,
    }
  },
  setup(props, {emit}) {
    const readFile  = (inputFile) => new Promise((resolve, reject) => {
      const reader  = new FileReader();
      reader.onload = (event) => {
        try       { resolve(JSON.parse(event.target.result)) }
        catch (e) { reject("El archivo a importar debe ser un archivo de configuración de «Hungry!» válido") }
      }
      reader.onerror = (event) => reject(event.target.error);
      reader.readAsText(inputFile);
    });

    const handleFileChange = async (event) => {
      const regex = typeof props.fileName === 'string' ? new RegExp(props.fileName, 'i') : props.fileName;
      if (props.forceFileName && props.fileName !== '' && !regex.test(event.target.files[0].name)) return emit('fileReadError',`Nombre de archivo erróneo,<br>se esperaba «${props.fileName}»`)
      if (props.maxFileSize!=null) if (event.target.files[0].size>props.maxFileSize)  return emit('fileReadError',`Archivo demasiado grande,<br>tamaño máximo ${props.maxFileSize/1024}KB`)
      try { emit('fileReaded', await readFile(event.target.files[0]))}
      catch (err) { emit('fileReadError',err.message) }
      event.target.value='';
    };

    return { handleFileChange, };
  },
  emits: ['fileReaded','fileReadError']
};
</script>

<style scoped>
  div   { position: relative; display: inline-flex; cursor: pointer; width: 100%; height: 3.125rem; justify-content: center; }
  input { display: none; }
  label { width: 100%; height: 100%; padding-top: .625rem; }
</style>
