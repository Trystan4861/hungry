/**
 * Funciones de utilidad para manipulación del DOM
 */

/**
 * Selecciona múltiples elementos del DOM
 * @param selector Selector CSS
 * @param root Elemento raíz (por defecto document)
 * @returns NodeList con los elementos seleccionados
 */
export const DOM = (selector: string, root: Document | HTMLElement | null = document): NodeListOf<Element> => {
  if (!root) return document.querySelectorAll(selector);
  return root.querySelectorAll(selector);
};

/**
 * Selecciona un único elemento del DOM
 * @param selector Selector CSS
 * @param root Elemento raíz (por defecto document)
 * @returns Elemento seleccionado o null si no existe
 */
export const _DOM = (selector: string, root: Document | HTMLElement | null = document): Element | null => {
  if (!root) return document.querySelector(selector);
  return root.querySelector(selector);
};

/**
 * Obtiene un elemento por su ID y lo convierte a HTMLElement
 * @param id ID del elemento
 * @param scope Elemento raíz (por defecto document)
 * @returns HTMLElement o null si no existe
 */
export const DID = (id: string, scope: Document = document): HTMLElement | null => 
  scope.getElementById(id) as HTMLElement | null;

/**
 * Obtiene los nodos hijos de un elemento que son elementos HTML
 * @param selector Elemento del cual obtener los hijos
 * @returns Array con los nodos hijos
 */
export const getChildNodes = (selector: Element | null): Element[] => {
  if (!selector) return [];
  return Array.from(selector.childNodes).filter(item => item.nodeType === 1) as Element[];
};

/**
 * Obtiene los nodos hijos de un elemento por su ID
 * @param id ID del elemento
 * @param scope Elemento raíz (por defecto document)
 * @returns Array con los nodos hijos
 */
export const getChildNodesID = (id: string, scope: Document = document): Element[] => 
  getChildNodes(DID(id, scope));

/**
 * Obtiene los nodos hijos de elementos por su clase
 * @param clase Clase CSS
 * @param scope Elemento raíz (por defecto document)
 * @returns Array con los nodos hijos
 */
export const getChildNodesClass = (clase: string, scope: Document | HTMLElement = document): Element[] => {
  const elements = DOM(clase, scope);
  if (elements.length === 0) return [];
  return getChildNodes(elements[0]);
};
