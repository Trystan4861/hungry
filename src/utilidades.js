//import { useStore } from "vuex";
//import { store } from "./store";

import { localStorageService } from "./localStorageService";

// función para encontrar el índice de un elemento en un array por su ID
export function findIndexById(whatID, where) { return where.findIndex(item => item.id === whatID); }

export function dispatch(store,where,what,setLocalStorage=true){ 
  store.dispatch(`set${where.replace(/\b\w/g,c=>c.toUpperCase())}`,  setLocalStorage?localStorageService.setSubItem(where, what):what); 
  return what;
}
export function dispatchWhere(store,where,what,setLocalStorage=true){ 
  dispatch(store,where,what,setLocalStorage) 
  return where;
}
  
// función para generar un ID aleatorio
export function generateID(){return Math.random().toString(36).slice(2)}

// función para obtener datos desde el localStorage y guardarlos en el store si no son datos de configuración
// si no hay datos en el localStorage, se obtienen los datos por defecto del store y se guardan en el localStorage
// se devuelven los datos obtenidos del localStorage o los datos por defecto del store si no hay datos en el localStorage
export function getDataFromLocalStorage (store,index) {
  let storedData=null
  storedData = (index!= 'state')?localStorageService.getSubItem(index):localStorageService.getItem();
  if (storedData ) dispatch(store,index, storedData);
  return storedData ?? index!= 'state'?localStorageService.setSubItem(index, store.getters.getConfiguracion()[index]):null;
}

// funcion para obtener un elemento por su ID
export function DID(id,scope=document){return scope.getElementById(id)}

// funcion para obtener elementos por su selector
export function DOM(selector,scope=document){return scope.querySelectorAll(selector)}

// funcion para obtener un elemento por su selector
export function _DOM(selector,scope=document){return scope.querySelector(selector)}

// función para crear una copia profunda de un array|objeto usando JSON
export function createCopy(ofWhat){ return JSON.parse(JSON.stringify(ofWhat))}//return ofWhat.map(item => ({ ...item }))}

// función para obtener los hijos de un elemento
export function getChildNodes(ofWhat){return Array.from(ofWhat.childNodes).filter(item=>item.nodeType===1)} 

// función para obtener los hijos de un elemento por su ID
export function getChildNodesID(id){return getChildNodes(document.getElementById(id))}


/*
function onTime(hora, callback) {
  const horaActual = new Date(); // Obtener la hora actual
  const [hh, mm, ss] = hora.split(':').map(Number); // Dividir la hora en horas, minutos y segundos
  const horaEspecifica = new Date(horaActual.getFullYear(), horaActual.getMonth(), horaActual.getDate(), hh, mm, ss); // Crear una nueva fecha con la hora especificada y la fecha actual
  const diferencia = horaEspecifica - horaActual; // Calcular la diferencia de tiempo hasta la hora especificada
  if (diferencia < 0) return console.error('La hora especificada ya ha pasado hoy.'); // Verificar si la hora especificada ya pasó hoy
  return setTimeout(callback, diferencia); // Establecer un temporizador para ejecutar el callback en la hora especificada y devuelve su puntero
}
const _DOM=(selector,scope=document)=>scope.querySelector(selector)
const entrada=()=>{
  _DOM("[value='15583827']",_DOM("#chrono-form")).selected=true
  _DOM("[value='telework']",_DOM("#chrono-form")).checked=true  
  _DOM("[data-gtm-action='chrono start']",_DOM("#chrono-form")).click()
}
const salida=()=>_DOM("[data-gtm-action='chrono stop']",_DOM("#chrono-form")).click()
onTime("08:30:05", entrada);
onTime("13:55:00", salida);
onTime("15:30:07", entrada);
*/