<template>
  <img :class="className" :src="imageSource">
</template>

<script>
export default {
  name: 'MyImageLoader',
  props: {
    image: {
      type: [String, File], // Permitimos tanto String (URL) como File (imagen en base64)
      required: true
    },
    className: {
      type: String,
      default: 'image-cdn'
    },
    urlCdn:{
      type: String,
      default: 'https://ik.imagekit.io/trystan4861/hungry/'
    }

  },
  computed: {
    imageSource() {
      // Si la imagen es una URL, la devolvemos directamente
      if (typeof this.image === 'string') {
        if (!this.image.startsWith('data:'))
          return `${this.urlCdn}${this.urlCdn.endsWith('/')?'':'/'}${this.image}`;
        else
          return this.image;
      }
      // Si la imagen es un objeto File (imagen en base64), generamos la URL usando createObjectURL
      else if (this.image instanceof File) {
        return URL.createObjectURL(this.image);
      }
      // En caso contrario, lanzamos un error
      else {
        throw new Error('Tipo de imagen no compatible. Se esperaba una URL o un objeto File.');
      }
    }
  },
  // Asegúrate de revocar la URL del objeto cuando el componente se destruye para evitar memory leaks
  beforeUnmount() {
    if (this.image instanceof File) {
      URL.revokeObjectURL(this.imageSource);
    }
  }
}
</script>
