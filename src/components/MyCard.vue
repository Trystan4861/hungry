<template>
  <div class="card" :style="cardStyle">
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props         = defineProps({
  height:         { type: Number, default: 0          },
  heightModifier: { type: Number, default: 0          },
  borderStyle:    { type: String, default: 'squared'  },
});

const borderStyles  = {
  'rounded':              '.5rem                    ',
  'rounded-top':          '.5rem  .5rem 0     0     ',
  'rounded-bottom':       '0      0     .5rem .5rem ',
  'rounded-top-left':     '.5rem  0     0     0     ',
  'rounded-top-right':    '0      .5rem 0     0     ',
  'rounded-bottom-left':  '0      0     .5rem 0     ',
  'rounded-bottom-right': '0      0     0     .5rem ',
};

const cardStyle     = computed(() => {
  return {
    'height':         `${props.height + props.heightModifier}px`,
    'border-radius':  borderStyles[props.borderStyle.toLowerCase()] || '0',
  };
});
</script>

<style scoped>
  @import url('@css/MyCard.vue.css');
</style>