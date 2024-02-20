// localStorageService.js

export const localStorageService = {
  // Función para almacenar datos en el Local Storage
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  // Función para recuperar datos del Local Storage
  getItem(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  // Función para eliminar un elemento del Local Storage
  removeItem(key) {
    localStorage.removeItem(key);
  }
};
