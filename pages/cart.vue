<script setup lang="ts">
import { myStore } from "~/composables/useStore";

const { purchased, toggleDone } = myStore();
</script>

<template>
  <div>
    <h1>Para Comprar</h1>
    <ul>
      <li v-for="item in purchased" :key="item.id">
        {{ item.text }} ({{ item.id_categoria }})
        <button @click="toggleDone(item.id)">
          ❌
        </button>
      </li>
    </ul>
  </div>
</template>
