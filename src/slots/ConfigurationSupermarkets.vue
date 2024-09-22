<template>
  <div id="SlotConfigurationSupermarkets">
    <div class="text-center mb-1 text-uppercase">Visibilidad de Supermercados</div>
    <div class="SupermarketsContainer">
      <MyCheckbox
        v-for="(item, index) in supermarkets.filter(i=>i.id>0)"
        :checkedValues="checkedItems"
        :key="item.id"
        :label="item.text"
        group="configSupermarketsVisibility"
        :required="true"
        :styled="true"
        :value="index"
        @checkedValues="handleCheckedValues"
      />
    </div>
  </div>
</template>

<script setup>
import MyCheckbox from '@components/MyCheckbox.vue';
import { ref, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store               = useStore();
const storeGet            = store.getters;
const supermarkets        = storeGet.getSupermercados();
const checkedItems        = ref([]);
const getVisibleIndices   = data => data.map((item, index) => (item.visible ? index : null)).filter(index => index !== null);
const handleCheckedValues = (newCheckedItems) => checkedItems.value = newCheckedItems.sort((a, b) => a - b) && emit('supermarketsChecked', newCheckedItems)
const emit                = defineEmits(['supermarketsChecked']);

watchEffect(() => checkedItems.value = getVisibleIndices(supermarkets));

</script>


<style scoped>
.SupermarketsContainer {
  height:             150px;
  overflow-y:         scroll;
  margin-bottom:      .625rem;
  border:             3px solid #555;
  border-right-width: 0;
  user-select:        none;
  padding-top:        15px;
}
</style>
