<template>
  <img :class="className" :src="imageSource">
</template>

<script>
  export default {
    name: 'MyImageLoader',
    props: {
      image:      { type: [String, File], required: true },
      className:  { type: String,         default:  'image-cdn' },
      urlCdn:     { type: String,         default:  'https://ik.imagekit.io/trystan4861/hungry/'},
    },
    computed: {
      imageSource() {
        if (typeof this.image === 'string') return (!this.image.startsWith('data:'))?`${this.urlCdn}${this.urlCdn.endsWith('/')?'':'/'}${this.image}`:this.image;
        else if (this.image instanceof File) return URL.createObjectURL(this.image);
        else throw new Error('Tipo de imagen no compatible. Se esperaba una URL o un objeto File.');
      }
    },
    beforeUnmount() { if (this.image instanceof File) URL.revokeObjectURL(this.imageSource); }
  }
</script>
