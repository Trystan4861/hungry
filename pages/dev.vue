<template>
  <div class="text-center">
    <h1>Dev</h1>
    <MyButton
      text="Alert"
      @click="showNotify()"
      class="mt-4 btn btn-success text-white fw-bold"
    />

  </div>
</template>
<script setup lang="ts">

import { notify } from "@kyvg/vue3-notification";
import { _DOM } from "~/utils/dom";

const showNotify = () => {
  notify({
    text: "Haz clic en el botón para ver más.",
    type: "success",
    group: "buttons",
    duration: 50000,
    closeOnClick: false,
    data: { buttonText: "Aceptar", onClick: () => alert("Botón presionado") },
  });
  }
</script>
<style scoped>

</style>
