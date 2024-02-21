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
    minHeight:{
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
      let borderRadius = '0px';
      switch (this.borderStyle.toLowerCase()) {
        case 'rounded':
          borderRadius = '8px';
          break;
        case 'rounded-bottom':
          borderRadius = '0 0 8px 8px';
          break;
        case 'rounded-top':
          borderRadius = '8px 8px 0 0';
          break;
      }
      return {
        'min-height': `${this.minHeight + this.heightModifier}px`,
        'border-radius': borderRadius
      };
    }
  }
};
</script>

<style scoped>
.card {
  background-color: #333;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 5px;
}

.card-body {
  padding: 5px;
}
</style>