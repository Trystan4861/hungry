<template>
  <div class="w-100">
    <input  ref="inputFileRef" :id="id"  type="file" :accept="accept" @change="handleFileChange">
    <button @click.stop="handleClick" :class="['btn', `btn-${props.btnClass}`,{ 'text-uppercase': props.uppercase }]" class="w-100 cursor-pointer">{{ text }}</button>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { generateID } from '@/utilidades'

  const props             = defineProps({
    fileName:       { validator: value => value instanceof RegExp || typeof value === 'string', default: () => /^.*hungry.*\.json$/i },
    accept:         { type: String,   default: "*.*"                  },
    forceFileName:  { type: Boolean,  default: false                  },
    maxFileSize:    { type: Number,   default: null                   },
    text:           { type: String,   default: 'Seleccionar archivo'  },
    btnClass:       { type: String,   default: 'primary'              },
    uppercase:      { type: Boolean,  default: true                   },
  });

  const inputFileRef          = ref(null)
  const readFile          = (inputFile) => new Promise((resolve, reject) => {
    const reader          = new FileReader();
    reader.onload         = event => {
      try         { resolve(JSON.parse(event.target.result))}
      catch (e)   { reject(new Error("El archivo a importar debe ser un archivo de configuración de «Hungry!» válido"))}
    };
    reader.onerror        = (event) => reject(event.target.error);
    reader.readAsText(inputFile);
  });

  const handleClick       = ()=>inputFileRef.value.click()
  const fileName_error    = computed(() => `Nombre de archivo erróneo,<br>se esperaba «${props.fileName}»`);
  const fileSize_error    = computed(() => `Archivo demasiado grande,<br>tamaño máximo ${props.maxFileSize / 1024}KB`);
  const emit=defineEmits(['fileReadError','fileReaded','fileReadError'])

  const handleFileChange  = async event => {
    const regex = typeof props.fileName === 'string' ? new RegExp(props.fileName, 'i') : props.fileName;
    const file=event.target.files[0];
    const errorCondition  =  (props.forceFileName && props.fileName !== '' && !regex.test(file.name)) ? fileName_error :
                             (props.maxFileSize != null && file.size > props.maxFileSize) ? fileSize_error :
                              null;
    if (errorCondition) emit('fileReadError', errorCondition      );
    else
      try         { emit('fileReaded',  await readFile(file))} 
      catch (e)   { emit('fileReadError', e.message         )}
    event.target.value    = '';
  };

  const id                = `inputFile-${generateID()}`;
</script>


<style scoped>
div   {
  position:         relative;
  display:          inline-flex;
  cursor:           pointer;
  width:            100%;
  height:           3.125rem;
  justify-content:  center;
}
input {
  display:          none;
}
button{
  padding: 0;
}
</style>
