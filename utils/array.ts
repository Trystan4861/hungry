/**
 * Funciones de utilidad para manipulación de arrays
 */

/**
 * Encuentra el índice de un elemento en un array por su ID
 * @param id ID del elemento a buscar
 * @param where Array donde buscar
 * @returns Índice del elemento o -1 si no se encuentra
 */
export const findIndexById = (id: string | number, where: any[]): number => 
  where.findIndex(item => item.id === id);

/**
 * Crea una copia profunda de un array u objeto usando JSON
 * @param of Objeto o array a copiar
 * @returns Copia profunda del objeto o array
 */
export const createCopy = <T>(of: T): T => 
  JSON.parse(JSON.stringify(of));
