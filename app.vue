<template>
  <div v-if="!dataLoaded" class="loading-container">
    <div class="loading-spinner"></div>
    <p class="loading-text">Cargando...</p>
  </div>
  <div v-else class="container">
    <header>
      <nav class="nav-tabs">
        <div v-for="tab in tabsData"
          class="nav-item nav-link"
          :class="{ active: currentPage === tab.page }"
          @click="currentPage = tab.page">
          <MyImage :image="tab.logo"/>
        </div>
        <DevOnly>
          <div to="/test" class="nav-item nav-link" @click="currentPage = 'dev'">
            <MyImage image="hungry.svg"/>
          </div>
        </DevOnly>
      </nav>
    </header>
    <main class="tab-content">
      <div class="tab-pane"
        v-for="tab in tabsData"
        :key="tab.page"
        :style="{ display: currentPage === tab.page ? 'block' : 'none' }"
      >
        <component :is="componentsMap[tab.page]" />
      </div>
      <div class="tab-pane" :style="{ display: currentPage === 'dev' ? 'block' : 'none' }">
        <component :is="componentsMap['dev']" />
      </div>
    </main>
  </div>
  <div id="swallDestination"></div>
  <notifications group="pwa" position="top center" width="50%"  />
  <notifications group="app" position="bottom center" width="50%"  />
  <Notifications group="buttons" position="bottom center" width="50%" :ignore-duplicates="true">
    <template #body="{ item }">
      <div class="vue-notification success">
        <div class="my-notification">
          <div class="row">
            <div class="col-12 notification-title">{{ item.title }}</div>
          </div>
          <div class="row">
            <div class="col-6">
              <div class="notification-content">{{ item.text }}</div>
            </div>
            <div class="col-6 text-end">
              <div class="btn btn-sm notification-button cursor-pointer"
                   :class="(item.data as NotifyItemData)?.buttonClass || 'btn-primary'"
                   @click="(item.data as NotifyItemData)?.onClick">
                {{ (item.data as NotifyItemData)?.buttonText }}
              </div>
            </div>
          </div>
        </div>
        <MyProgressBar class="notification-progress-bar" bgcolor="#42a85f" :is-notification="true" :duration="(item.data as NotifyItemData)?.progressBarDuration" />        </div>
      </template>
  </Notifications>
</template>

<script setup lang="ts">
import { myStore } from "~/composables/useStore";
import { useHead, useSeoMeta } from "#imports";
import { localStorageService as ls } from "~/localStorageService";
import { defineAsyncComponent } from "vue";
import { onMounted } from "@vue/runtime-core";
import { ref } from 'vue';
import type { Tab, NotifyItemData } from "./types";

import { Notifications } from "@kyvg/vue3-notification";


const store = myStore();
const tabsData: Tab[] = store.tabs
const dataLoaded = ref(false);

const currentPage = ref(tabsData[store.defaultTabActive.value].page);

const componentsMap = tabsData.reduce((acc, tab) => {
  acc[tab.page] = defineAsyncComponent(() => import(`~/pages/${tab.page}.vue`));
  return acc;
}, {} as Record<string, ReturnType<typeof defineAsyncComponent>>);
componentsMap.dev = defineAsyncComponent(() => import(`~/pages/test.vue`));

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