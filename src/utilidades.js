import { notify } from "@kyvg/vue3-notification";
import { localStorageService } from "./localStorageService";

// función para encontrar el índice de un elemento en un array por su ID
export const findIndexById            = (id, where) => where.findIndex(item => item.id === id);

export const dispatch                 = (store, where, what, setLocalStorage = true) => { 
  store.dispatch(`set${where.replace(/\b\w/g,c => c.toUpperCase())}`, setLocalStorage?localStorageService.setSubItem(where, what):what); 
  return what;
}
export const dispatchWhere            = (store , where, what, setLocalStorage = true) => { 
  dispatch(store, where, what, setLocalStorage) 
  return where;
}
 
// función para generar un ID aleatorio
export const generateID               = () => Math.random().toString(36).slice(2)

// función para obtener datos desde el localStorage y guardarlos en el store si no son datos de configuración
// si no hay datos en el localStorage, se obtienen los datos por defecto del store y se guardan en el localStorage
// se devuelven los datos obtenidos del localStorage o los datos por defecto del store si no hay datos en el localStorage
export const getDataFromLocalStorage  = (store,index) => {
  let storedData = null
  storedData = (index != 'state')?localStorageService.getSubItem(index):localStorageService.getItem();
  if (storedData ) dispatch(store,index, storedData);
  return storedData ?? index != 'state'?localStorageService.setSubItem(index, store.getters.getConfiguracion()[index]):null;
}

// funcion para obtener un elemento por su ID
export const DID                      = (id, scope = document) => scope.getElementById(id)

// funcion para obtener elementos por su selector
export const DOM                      = (selector, scope = document) => scope.querySelectorAll(selector)

// funcion para obtener un elemento por su selector
export const _DOM                     = (selector, scope = document) => scope.querySelector(selector)

// función para crear una copia profunda de un array|objeto usando JSON
export const createCopy               = of => JSON.parse(JSON.stringify(of))

// función para obtener los hijos de un elemento
export const getChildNodes            = selector => Array.from(selector.childNodes).filter(item => item.nodeType === 1) 

// función para obtener los hijos de un elemento por su ID
export const getChildNodesID          = (id, scope = document) => getChildNodes(DID(id, scope))

// funcion para obtener hos hijos de un elemento por su clase 
export const getChildNodesClass       = (clase, scope = document) => getChildNodes(DOM(clase, scope))

// funciones para mostrar mensajes de alerta usando notify
export const alert                    = (text, type = "success", duration = 3000, group = "app") => notify({ text, type, duration, group })
export const info                     = (text, type = "ingo",    duration = 3000, group = "app") => notify({ text, type, duration, group })
export const warning                  = (text, type = "warn",    duration = 3000, group = "app") => notify({ text, type, duration, group })