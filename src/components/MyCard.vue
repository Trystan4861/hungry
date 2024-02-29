<template>
  <div class="card" :style="cardStyle">
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyCard',
  props:{
    height:{
      type:Number,
      default:0
    },
    heightModifier:{
      type: Number,
      default:0
    },
    borderStyle:{
      type: String,
      default: 'squared'
    }
  },
  computed: {
    // Computa el estilo basado en el prop borderStyle
    cardStyle() {
      let borderRadius = '0';
      switch (this.borderStyle.toLowerCase()) {
        case 'rounded':
          borderRadius = '.5rem';
          break;
        case 'rounded-bottom':
          borderRadius = '0 0 .5rem .5rem';
          break;
        case 'rounded-top':
          borderRadius = '.5rem .5rem 0 0';
          break;
      }
      return {
        'height': `${this.height + this.heightModifier}px`,
        'border-radius': borderRadius,
      };
    }
  }
};
</script>

<style scoped>
.card {
  background-color: #333;
  border-radius: 0 0 .5rem .5rem;
  box-shadow: 0 .25rem .375rem rgba(0, 0, 0, 0.1);
  padding: .3125rem;
  overflow-y: auto;

}

.card-body {
  padding: .3125rem;
}
</style>