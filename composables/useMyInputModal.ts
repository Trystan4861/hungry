import { ref, markRaw, createApp, defineComponent, h } from 'vue';
import MyInputModal from '~/components/MyInputModal.vue';

/**
 * useMyInputModal
 * Composable para mostrar un modal con un campo de texto personalizado
 * @returns Objeto con la función showModal para mostrar el modal
 */
export const useMyInputModal = () => {
  /**
   * showModal
   * Muestra un modal con un campo de texto personalizado
   * @param title Título del modal
   * @param initialValue Valor inicial del campo de texto
   * @param placeholder Texto de ayuda para el campo de texto
   * @param confirmText Texto del botón de confirmación
   * @param cancelText Texto del botón de cancelación
   * @returns Promise que se resuelve con el resultado del modal
   */
  const showModal = (
    title: string,
    initialValue: string = '',
    placeholder: string = '',
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<{ confirmed: boolean; value: string }> => {
    return new Promise((resolve) => {
      // Crear un elemento div para montar el modal
      const modalContainer = document.createElement('div');
      document.body.appendChild(modalContainer);

      // Crear la aplicación Vue
      const app = createApp(
        defineComponent({
          setup() {
            const value = ref(initialValue);

            // Función para cerrar el modal
            const closeModal = () => {
              app.unmount();
              modalContainer.remove();
            };

            // Manejar la confirmación
            const handleConfirm = (inputValue: string) => {
              closeModal();
              resolve({ confirmed: true, value: inputValue });
            };

            // Manejar la cancelación
            const handleCancel = () => {
              closeModal();
              resolve({ confirmed: false, value: initialValue });
            };

            return () =>
              h(MyInputModal, {
                title,
                initialValue,
                placeholder,
                confirmText,
                cancelText,
                onConfirm: handleConfirm,
                onCancel: handleCancel,
                'onUpdate:modelValue': (val: string) => {
                  value.value = val;
                }
              });
          }
        })
      );

      // Montar la aplicación
      app.mount(modalContainer);
    });
  };

  return {
    showModal
  };
};