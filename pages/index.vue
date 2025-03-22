<script setup>
import { myStore } from '~/composables/useStore'
import { localStorageService as ls } from '~/localStorageService'

const router = useRouter()
const store = myStore()

// Asegurarnos de que solo se ejecute en el cliente
if (import.meta.client) {
  onMounted(() => {
    // Intentamos obtener la última pestaña seleccionada del localStorage
    const lastTab = ls.getSubItem('lastTab')
    
    if (lastTab) {
      // Si hay una última pestaña guardada, redirigimos a ella
      router.push(lastTab)
    } else {
      // Si no hay última pestaña, redirigimos a la primera pestaña seleccionable
      const defaultTab = store.tabs.find(tab => tab.selectable)
      if (defaultTab) {
        router.push(`/${defaultTab.page}`)
      }
    }
  })
}
</script>

<template>
  <div>
    Redirigiendo...
  </div>
</template>
