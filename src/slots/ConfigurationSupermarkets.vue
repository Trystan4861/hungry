<template>
  <div id="SlotConfigurationSupermarkets">
    <div class="text-center mb-1 text-uppercase">Visibilidad de Supermercados</div>
    <div class="SupermarketsContainer">
      <MyCheckbox
        v-for="(item, index) in supermarkets"
        :key="index"
        :value="index"
        :label="item.text"
        :checkedValues="checkedItems"
        group="configSupermarketsVisibility"
        :required="true"
        :styled="true"
        :enabled="item.editable"
        @update:checkedValues="handleCheckedValuesUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import MyCheckbox from '@components/MyCheckbox.vue';
import { ref, watchEffect } from 'vue';

const props = defineProps({
  supermarkets: { type: Array, required: true }
});

const checkedItems      = ref([]);
const visibleSupermarkets = ref([]);

const getVisibleIndices = data => data.map((item, index) => (item.visible ? index : null)).filter(index => index !== null);

watchEffect(() => {
  visibleSupermarkets.value = props.supermarkets.filter(item => item.visible);
  checkedItems.value = getVisibleIndices(props.supermarkets);
});

const handleCheckedValuesUpdate = (newCheckedItems) => {
  checkedItems.value = newCheckedItems.sort((a, b) => a - b);
  emit('supermarketsChecked', newCheckedItems);
};

const emit = defineEmits(['supermarketsChecked']);

</script>


<style scoped>
.SupermarketsContainer {
  height:             150px;
  overflow-y:         scroll;
  margin-bottom:      .625rem;
  border:             1px solid;
  border-right-width: 0;
  user-select:        none;
  padding-top:        15px;
}
::-webkit-scrollbar       { 
  height:             4px; 
  width:              4px; 
}
::-webkit-scrollbar-track { 
  background:       #f0f0f0; 
}
::-webkit-scrollbar-thumb { 
  background:       #888; 
}
</style>
