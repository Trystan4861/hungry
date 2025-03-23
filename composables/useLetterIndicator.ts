import { ref, onMounted } from "vue";

export function useLetterIndicator(scrollContainerRef: any) {
  const letraActualRef = ref<HTMLElement | null>(null);
  const letraActual = ref('');
  const showLetraActual = ref(false);
  const ocultaTooltipTimeout = ref<number | null>(null);

  // Funciones para la letra actual
  const muestraOcultaTooltip = () => {
    showLetraActual.value = !showLetraActual.value;
  };

  const updateTooltip = () => {
    if (!scrollContainerRef.value || !letraActualRef.value) return;
    
    const productos = scrollContainerRef.value.querySelectorAll(".productText");
    for (let producto of productos) {
      if (producto.getBoundingClientRect().top < letraActualRef.value.getBoundingClientRect().top) continue;
      const productName = producto.querySelector(".productName");
      if (productName && productName.textContent) {
        letraActual.value = productName.textContent[0].toUpperCase();
        break;
      }
    }
    
    if (!showLetraActual.value) {
      muestraOcultaTooltip();
      if (ocultaTooltipTimeout.value !== null) {
        clearTimeout(ocultaTooltipTimeout.value);
      }
      ocultaTooltipTimeout.value = setTimeout(muestraOcultaTooltip, 1000) as unknown as number;
    }
  };

  onMounted(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.addEventListener('scroll', updateTooltip, { passive: true });
    }
  });

  return {
    letraActualRef,
    letraActual,
    showLetraActual
  };
}
