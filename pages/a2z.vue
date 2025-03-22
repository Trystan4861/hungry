<script setup lang="ts">
import { myStore } from "~/composables/useStore";

const { sortedA2Z, toggleSelected } = myStore();
</script>

<template>
  <div>
    <h1>Lista Alfabética</h1>
    <ul>
      <li v-for="item in sortedA2Z" :key="item.id">
        {{ item.text }} ({{ item.id_categoria }})
        <button @click="toggleSelected(item.id)">
          {{ item.selected ? "✅" : "🛒" }}
        </button>
      </li>
    </ul>
  </div>
</template>
