<template>
  <div class="MyImage" :class="className" :style="{backgroundImage: 'url('+imageSource+')'}"/>
</template>

<script setup>
import { defineProps, computed, onBeforeUnmount } from 'vue';

const props       = defineProps({
  image:      { type: [String, File], required: true                                          },
  className:  { type: String,         default:  'image-cdn'                                   },
  urlCdn:     { type: String,         default:  'https://ik.imagekit.io/trystan4861/hungry/'  },
});

const imageSource = computed(() => typeof props.image === 'string' ?
  (!props.image.startsWith('data:') ? `${props.urlCdn}${props.urlCdn.endsWith('/') ? '' : '/'}${props.image}` : props.image) :
  (props.image instanceof File ? URL.createObjectURL(props.image) : "")
);
onBeforeUnmount(() => props.image instanceof File)?URL.revokeObjectURL(imageSource.value):null;
</script>
<style scoped>
.MyImage{
  width: 50px;
  height: 50px;
  background-size: 50px;
  margin-right: 10px;
}</style>