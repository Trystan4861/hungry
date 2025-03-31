<template>
  <div :id="id" class="MyImage" :style="{backgroundImage: 'url('+imageSource+')'}"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
const uri = 'https://ik.imagekit.io/hzuwkjlsb/SVGs/';


interface Props {
  image: string ;
  className?: string;
  urlCdn?: string;
}
const props: Props  = defineProps({
  image: { type: String, required: true },
  className: { type: String, default: 'image-cdn' },
  urlCdn: { type: String, default: uri },
});
const id = props.image ? `image-${props.image.replace(".svg", '')}` : 'image-default';
const imageSource = computed<string>((): string => typeof props.image === 'string' ?
  (!props.image.startsWith('data:') ? `${props.urlCdn ?? uri}${(props.urlCdn ?? uri).endsWith('/') ? '' : '/'}${props.image}` : props.image) :""
);

</script>


<style scoped>
.MyImage {
  width: 50px;
  height: 50px;
  background-size: 50px;
}
</style>