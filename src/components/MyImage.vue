<template>
  <img width="50" height="50" :class="className" :src="imageSource" :alt="alt">
</template>

<script setup>
import { defineProps, computed, onBeforeUnmount } from 'vue';

const props       = defineProps({
  image:      { type: [String, File], required: true                                          },
  className:  { type: String,         default:  'image-cdn'                                   },
  urlCdn:     { type: String,         default:  'https://ik.imagekit.io/trystan4861/hungry/'  },
});

const alt         = computed(() => typeof props.image === 'string' ? (!props.image.startsWith('data:') ? props.image : "Empty image") : "Empty Image");
const imageSource = computed(() => typeof props.image === 'string' ?
  (!props.image.startsWith('data:') ? `${props.urlCdn}${props.urlCdn.endsWith('/') ? '' : '/'}${props.image}` : props.image) :
  (props.image instanceof File ? URL.createObjectURL(props.image) : "")
);
onBeforeUnmount(() => props.image instanceof File)?URL.revokeObjectURL(imageSource.value):null;
</script>
<style scoped>
  @import url('@css/MyImage.vue.css');
</style>
