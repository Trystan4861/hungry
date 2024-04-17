//import { useStore } from "vuex";
//import { store } from "./store";

import { localStorageService } from "./localStorageService";

// función para encontrar el índice de un elemento en un array por su ID
export function findIndexById(whatID, where) {
  return where.findIndex(item => item.id === whatID);
}

export function dispatch(store,where,what,setLocalStorage=true){ 
  store.dispatch(`set${where.replace(/\b\w/g,c=>c.toUpperCase())}`,  setLocalStorage?localStorageService.setSubItem(where, what):what); 
  return what;
}

// función para generar un ID aleatorio
export function generateID(){return Math.random().toString(36).slice(2)}

// función para obtener datos desde el localStorage y guardarlos en el store si no son datos de configuración
// si no hay datos en el localStorage, se obtienen los datos por defecto del store y se guardan en el localStorage
// se devuelven los datos obtenidos del localStorage o los datos por defecto del store si no hay datos en el localStorage
export function getDataFromLocalStorage (store,index) {
  let storedData=null
  if (index!= 'configuracion')
    storedData = localStorageService.getSubItem(index);
  else
    storedData = localStorageService.getItem();
  if (storedData )
    dispatch(store,index, storedData);
  return storedData ?? localStorageService.setSubItem(index, store.getters.getConfiguracion()[index]);
}

// función para crear una copia profunda de un array|objeto usando JSON
export function createCopy(ofWhat){ return JSON.parse(JSON.stringify(ofWhat))}//return ofWhat.map(item => ({ ...item }))}