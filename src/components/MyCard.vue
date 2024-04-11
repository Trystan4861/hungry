<template>
  <div class="card" :style="cardStyle">
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';


const props         = defineProps({
  height:         { type: Number, default: 0          },
  heightModifier: { type: Number, default: 0          },
  borderStyle:    { type: String, default: 'squared'  },
});

const store=useStore()
const storeGet=store.getters
const height=ref(props.height)

if (props.height==0)
{
  height.value=storeGet.getAlturaDisponible()
}

const borderStyles  = {
  'rounded':              '.5rem  .5rem .5rem .5rem ',
  'squared':              '0      0     0     0     ',
  'rounded-top-left':     '.5rem  0     0     0     ',
  'rounded-top-right':    '0      .5rem 0     0     ',
  'rounded-bottom-left':  '0      0     .5rem 0     ',
  'rounded-bottom-right': '0      0     0     .5rem ',
  'rounded-bottom':       '0      0     .5rem .5rem ',
  'rounded-top':          '.5rem  .5rem 0     0     ',
};

const cardStyle     = computed(() => {
  return {
    'height':         `${height.value + props.heightModifier}px`,
    'border-radius':  borderStyles[props.borderStyle.toLowerCase()] || '0',
  };
});
watch(()=>storeGet.getAlturaDisponible(),newValue=>height.value=newValue)
defineExpose({height})
</script>

<style scoped>
.card {
  background-color: #333;
  border-radius:      0 0 .5rem .5rem;
  box-shadow:         0 .25rem .375rem rgba(0, 0, 0, 0.1);
  overflow-x:         hidden;
  overflow-y:         auto;
  padding:            .3125rem;
}
.card-body {
  padding:            .3125rem;
}

</style>