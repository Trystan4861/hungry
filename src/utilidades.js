import { useStore } from "vuex";
import { localStorageService } from "./localStorageService";

// función para encontrar el índice de un elemento en un array por su ID
export function findIndexById(whatID, where) {
  return where.findIndex(item => item.id === whatID);
}

// función para generar un ID aleatorio
export function generateID(){return Math.random().toString(36).slice(2)}

// función para obtener datos desde el localStorage y guardarlos en el store si no son datos de configuración
// si no hay datos en el localStorage, se obtienen los datos por defecto del store y se guardan en el localStorage
// se devuelven los datos obtenidos del localStorage o los datos por defecto del store si no hay datos en el localStorage
export function getDataFromLocalStorage (index) {
  let storedData = localStorageService.getSubItem(index);
  const store=useStore()

  if (storedData && index != 'configuracion' ) store.dispatch(`set${index.replace(/\b\w/g,c=>c.toUpperCase())}`, storedData);
  return storedData ?? localStorageService.setSubItem(index, store.getters.getConfiguration()[index]);
}
