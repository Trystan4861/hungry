<template>
  <div class="sync-status" :class="syncStatus">
    <div class="sync-icon">
      <i v-if="syncStatus === 'synced'" class="sync-icon-check">✓</i>
      <i v-else-if="syncStatus === 'syncing'" class="sync-icon-spinner">↻</i>
      <i v-else-if="syncStatus === 'error'" class="sync-icon-error">!</i>
      <i v-else class="sync-icon-offline">⚪</i>
    </div>
    <div class="sync-text" v-if="showText">
      <span v-if="syncStatus === 'synced'">Sincronizado</span>
      <span v-else-if="syncStatus === 'syncing'">Sincronizando...</span>
      <span v-else-if="syncStatus === 'error'">Error de sincronización</span>
      <span v-else>Sin sincronizar</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSync } from '~/composables/useSync';
import { myStore } from '~/composables/useStore';

const props = defineProps({
  showText: {
    type: Boolean,
    default: true
  }
});

const store = myStore();
const { syncStatus, isSyncing, lastSyncTime, syncError } = useSync();

// Verificar si el usuario está conectado
const isLoggedIn = computed(() => store.loginData.value.logged);

// Calcular el estado de sincronización
const displaySyncStatus = computed(() => {
  if (!isLoggedIn.value) return 'offline';
  return syncStatus.value;
});
</script>

<style scoped>
.sync-status {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.sync-icon {
  margin-right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.sync-icon-check {
  color: #28a745;
}

.sync-icon-spinner {
  color: #007bff;
  animation: spin 1s linear infinite;
}

.sync-icon-error {
  color: #dc3545;
}

.sync-icon-offline {
  color: #6c757d;
}

.synced {
  background-color: rgba(40, 167, 69, 0.1);
}

.syncing {
  background-color: rgba(0, 123, 255, 0.1);
}

.error {
  background-color: rgba(220, 53, 69, 0.1);
}

.offline, .not-synced {
  background-color: rgba(108, 117, 125, 0.1);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>