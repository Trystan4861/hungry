<template>
  <div class="text-center">
    <h1>Dev</h1>
    <MyCheckbox v-for="value in values"
      :key="value"
      :value="value"
      :label="'Checkbox ' + value"
      :styled="true"
      :checkedValues="checkedValues"
      :required="true"
      group="lista"
      @checked-values="handleCheckedValues"
      @last-checked-deletion-attempt="handleLastCheckedDeletionAttempt"
    />
  </div>
</template>
<script setup lang="ts">
  import { ref } from "vue";
  import MyCheckbox from "~/components/MyCheckbox.vue";
  const values = [1,2];
  const checkedValues = ref(values);

  function handleCheckedValues(value: Array<number>) {
    checkedValues.value = value;
    console.log("Checkbox values: " + checkedValues.value);
    }

  function handleLastCheckedDeletionAttempt(value: Array<number>) {
    console.log("Last checked deletion attempt");
    console.log("Checkbox values: " + checkedValues.value);
    }
</script>
<style scoped>

</style>
