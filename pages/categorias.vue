<script setup lang="ts">
import { myStore } from "~/composables/useStore";

const { sortedByCategory, toggleSelected } = myStore();
</script>

<template>
  <div>
    <h1>Lista por Categoría</h1>
    <ul>
      <li v-for="item in sortedByCategory" :key="item.id">
        {{ item.text }} ({{ item.id_categoria }})
        <button @click="toggleSelected(item.id)">
          {{ item.selected ? "✅" : "🛒" }}
        </button>
      </li>
    </ul>
  </div>
</template>
