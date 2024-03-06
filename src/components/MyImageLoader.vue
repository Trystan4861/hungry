<template>
  <img :class="className" :src="imageSource" :alt="alt">
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
      alt(){
        if (typeof this.image === 'string') return (!this.image.startsWith('data:'))?this.image:"Empty image"
        else return "Empty Image"
      },
      imageSource() {
        if (typeof this.image === 'string') return (!this.image.startsWith('data:'))?`${this.urlCdn}${this.urlCdn.endsWith('/')?'':'/'}${this.image}`:this.image;
        else if (this.image instanceof File) return URL.createObjectURL(this.image);
        else throw new Error('Tipo de imagen no compatible. Se esperaba una URL o un objeto File.');
      }
    },
    beforeUnmount() { if (this.image instanceof File) URL.revokeObjectURL(this.imageSource); }
  }
</script>
