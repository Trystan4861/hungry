<script setup lang="ts">
import { myStore } from "~/composables/useStore";
import { useHead, useSeoMeta } from "#imports";
import { localStorageService as ls } from "~/localStorageService";
import { ref } from 'vue';

const store = myStore();
const dataLoaded = ref(false);

useSeoMeta({
  description: 'Lista de la compra realizada en Nuxt',
  ogTitle: 'Hungry! by Trystan4861',
  ogDescription: 'Lista de la compra realizada en Nuxt',
  ogImage: 'https://ik.imagekit.io/trystan4861/hungry/hungry.svg',
  ogUrl: 'https://hungry.infoinnova.es',
  twitterTitle: 'Hungry! by Trystan4861',
  twitterDescription: 'Lista de la compra realizada en Nuxt',
  twitterImage: 'https://ik.imagekit.io/trystan4861/hungry/hungry.svg',
  twitterCard: 'summary',
  twitterCreator: '@trystan4861',
})

useHead({
  htmlAttrs: {
    lang: 'es'
  },
  title: 'Hungry! by Trystan4861',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [{ rel: 'icon', type: 'image/svg+xml', href: 'https://ik.imagekit.io/trystan4861/hungry/hungry.svg' }],
})

onMounted(async () => {
  // obtenemos el store guardado en localStorage
  const data = ls.getItem();
  if (data) { // si existe
    store.importData(data); // importamos los datos en el store
  }
  else { // si no existe
    ls.setItem(store.exportData()); // guardamos los datos predeterminados en localStorage
  }
  
  // Pequeño retraso para asegurar que los datos estén cargados completamente
  await new Promise(resolve => setTimeout(resolve, 50));
  dataLoaded.value = true;
})

</script>

<template>
  <NuxtLayout v-if="dataLoaded">
    <NuxtPage />
  </NuxtLayout>
  <div v-else class="loading-container">
    <div class="loading-spinner"></div>
    <div class="loading-text">Cargando...</div>
  </div>
  <div id="swallDestination"></div>
</template>

<style scoped>
  .container {
    max-width: 100vw;
    overflow-x: hidden;
  }
  .tab-content {
    overflow: auto;
    min-width: 21rem;
    width: 100%;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
  }

  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 20px;
    font-size: 1.2rem;
    color: #333;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
