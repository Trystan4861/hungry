import { ref, onMounted } from 'vue';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';
import { compactString } from '~/utils/fingerprint';
import { myStore } from '~/composables/useStore';

/**
 * useFingerprint
 * Composable para gestionar la huella digital del dispositivo
 * @returns Funciones y estados relacionados con la huella digital
 */
export function useFingerprint() {
  const store = myStore();
  const fingerID = ref(store.loginData.value.fingerID || '');

  /**
   * getFingerprint
   * Función para obtener la huella digital del dispositivo
   * @returns Huella digital compactada
   */
  const getFingerprint = async (): Promise<string> => {
    try {
      const fpPromise = FingerprintJS.load();
      const fp = await fpPromise;
      const result = await fp.get();
      const compactedId = compactString(result.visitorId);
      fingerID.value = compactedId;

      // Actualizar el fingerID en el store
      store.loginData.value.fingerID = compactedId;

      return compactedId;
    } catch (error) {
      console.error('Error al obtener fingerprint:', error);
      return '';
    }
  };

  // Cargar el fingerprint al montar el componente
  onMounted(async () => {
    if (!fingerID.value) {
      await getFingerprint();
    }
  });

  return {
    fingerID,
    getFingerprint
  };
}