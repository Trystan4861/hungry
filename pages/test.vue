<template>
    <div class="text-center">
      <h1>TEST</h1>
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
    let duration = 2000;
    notify({
      text: "Este es el mensaje numero de la notificacion",
      group: "buttons",
      duration,
      closeOnClick: false,
      data: { progressBarDuration:duration, buttonText: "Aceptar", onClick: () => alert("Botón presionado") },
    });
    }
  </script>
  <style scoped></style>