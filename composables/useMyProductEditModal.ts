import { createApp, defineComponent, h } from 'vue';
import MyProductEditModal from '~/components/MyProductEditModal.vue';
import type { Producto } from '~/types';

/**
 * useMyProductEditModal
 * Composable para mostrar un modal de edición de productos
 * @returns Objeto con la función showModal para mostrar el modal de edición
 */
export const useMyProductEditModal = () => {
  /**
   * showModal
   * Muestra un modal para editar un producto
   * @param product Producto a editar
   * @param title Título del modal
   * @param confirmText Texto del botón de confirmación
   * @param cancelText Texto del botón de cancelación
   * @returns Promise que se resuelve con el resultado del modal y los datos actualizados
   */
  const showModal = (
    product: Producto,
    title: string = 'Editar Producto',
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<{ confirmed: boolean; updatedProduct: Partial<Producto> }> => {
    return new Promise((resolve) => {
      // Crear un elemento div para montar el modal
      const modalContainer = document.createElement('div');
      document.body.appendChild(modalContainer);

      // Crear la aplicación Vue
      const app = createApp(
        defineComponent({
          setup() {
            // Función para cerrar el modal
            const closeModal = () => {
              app.unmount();
              modalContainer.remove();
            };

            // Manejar la confirmación
            const handleConfirm = (updatedProduct: Partial<Producto>) => {
              closeModal();
              resolve({ confirmed: true, updatedProduct });
            };

            // Manejar la cancelación
            const handleCancel = () => {
              closeModal();
              resolve({ confirmed: false, updatedProduct: {} });
            };

            return () =>
              h(MyProductEditModal, {
                title,
                product,
                confirmText,
                cancelText,
                onConfirm: handleConfirm,
                onCancel: handleCancel
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