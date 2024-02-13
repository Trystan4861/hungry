<template>
  <div class="tabs">
    <div
      v-for="(tab, index) in tabs"
      :key="index"
      :class="{ active: activeTab === index }"
      @click="activateTab(index)"
      class="tab"
    >
      {{ tab }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabUI1',
  props: {
    tabs: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      activeTab: 0
    };
  },
  methods: {
    activateTab(index) {
      this.activeTab = index;
      this.$emit('tabChanged', index);
    }
  }
};
</script>

<style>
.tabs {
  display: flex;
}

.tab {
  padding: 10px;
  cursor: pointer;
}

.tab.active {
  font-weight: bold;
}
</style>