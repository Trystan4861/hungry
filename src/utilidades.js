import { localStorageService } from "./localStorageService";

// función para encontrar el índice de un elemento en un array por su ID
export const findIndexById = (whatID, where) => where.findIndex(item => item.id === whatID);

export const dispatch = (store,where,what,setLocalStorage = true) => { 
  store.dispatch(`set${where.replace(/\b\w/g,c => c.toUpperCase())}`, setLocalStorage?localStorageService.setSubItem(where, what):what); 
  return what;
}
export const dispatchWhere = (store,where,what,setLocalStorage = true) => { 
  dispatch(store,where,what,setLocalStorage) 
  return where;
}
 
// función para generar un ID aleatorio
export const generateID = () => Math.random().toString(36).slice(2)

// función para obtener datos desde el localStorage y guardarlos en el store si no son datos de configuración
// si no hay datos en el localStorage, se obtienen los datos por defecto del store y se guardan en el localStorage
// se devuelven los datos obtenidos del localStorage o los datos por defecto del store si no hay datos en el localStorage
export const getDataFromLocalStorage = (store,index) => {
  let storedData = null
  storedData = (index != 'state')?localStorageService.getSubItem(index):localStorageService.getItem();
  if (storedData ) dispatch(store,index, storedData);
  return storedData ?? index != 'state'?localStorageService.setSubItem(index, store.getters.getConfiguracion()[index]):null;
}

// funcion para obtener un elemento por su ID
export const DID = (id,scope = document) => scope.getElementById(id)

// funcion para obtener elementos por su selector
export const DOM = (selector,scope = document) => scope.querySelectorAll(selector)

// funcion para obtener un elemento por su selector
export const _DOM = (selector,scope = document) => scope.querySelector(selector)

// función para crear una copia profunda de un array|objeto usando JSON
export const createCopy = ofWhat => JSON.parse(JSON.stringify(ofWhat))

// función para obtener los hijos de un elemento
export const getChildNodes = selector => Array.from(selector.childNodes).filter(item => item.nodeType === 1) 

// función para obtener los hijos de un elemento por su ID
export const getChildNodesID = (id,scope = document) => getChildNodes(DID(id,scope))

// funcion para obtener hos hijos de un elemento por su clase 
export const getChildNodesClass = (clase,scope = document) => getChildNodes(DOM(clase,scope))