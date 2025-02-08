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

// funcion para parsear emojis y encapsularlos en un span con la clase emoji
export parseEmoji = (text) => {
    // eslint-disable-next-line
    const emojiRegex = /([\u{203C}\u{2049}\u{20E3}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{231B}\u{23E9}-\u{23EC}\u{23F0}\u{23F3}\u{24C2}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2601}\u{260E}\u{2611}\u{2614}-\u{2615}\u{261D}\u{263A}\u{2648}-\u{2653}\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267F}\u{2693}\u{26A0}-\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270C}\u{270F}\u{2712}\u{2714}\u{2716}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{1F004}\u{1F0CF}\u{1F201}-\u{1F202}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F23A}\u{1F250}-\u{1F251}\u{1F300}-\u{1F320}\u{1F330}-\u{1F335}\u{1F337}-\u{1F37C}\u{1F380}-\u{1F393}\u{1F3A0}-\u{1F3C4}\u{1F3C6}-\u{1F3CA}\u{1F3E0}-\u{1F3F0}\u{1F400}-\u{1F43E}\u{1F440}\u{1F442}-\u{1F4F7}\u{1F4F9}-\u{1F4FC}\u{1F500}-\u{1F507}\u{1F509}-\u{1F53D}\u{1F550}-\u{1F567}\u{1F5FB}-\u{1F640}\u{1F645}-\u{1F64F}\u{1F680}-\u{1F68A}\u{1FA00}-\u{1FAFF}])/gu;
    // eslint-disable-next-line
    const regionalIndicatorRegex = /([\uD83C][\uDDE6-\uDDFF]){2}/g;
    return text.replace(emojiRegex, '<span class="emoji">$1</span>').replace(regionalIndicatorRegex, '<span class="emoji">$&</span>');
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