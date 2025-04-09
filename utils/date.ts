/**
 * Formatea una fecha a formato MySQL (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateToMySQL(date: Date): string {
  return date.toISOString()
    .replace('T', ' ')
    .split('.')[0];
}

/**
 * Compara dos timestamps en formato MySQL
 * Retorna:
 * -1 si timestamp1 es menor que timestamp2
 *  0 si son iguales
 *  1 si timestamp1 es mayor que timestamp2
 */
export function compareTimestamps(timestamp1: string, timestamp2: string): number {
  const date1 = new Date(timestamp1.replace(' ', 'T'));
  const date2 = new Date(timestamp2.replace(' ', 'T'));

  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

/**
 * formatFechaConLeadingZero
 * Formatea una fecha asegurando que los meses y días tengan ceros iniciales
 * @param timestamp - Timestamp en milisegundos
 * @returns Fecha formateada con ceros iniciales en día y mes (DD/MM/YYYY HH:MM:SS)
 */
export const formatFechaConLeadingZero = (timestamp: number): string => {
    const fecha = new Date(timestamp);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${hora}:${minutos}:${segundos}`;
  };

  /**
   * formatToMySQLTimestamp
   * Convierte una fecha a formato timestamp de MySQL (YYYY-MM-DD HH:MM:SS)
   * @returns String con formato de timestamp MySQL
   */
  export const formatToMySQLTimestamp = (): string => {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  };

  /**
   * parseTimestamp
   * Convierte un timestamp de MySQL a un objeto Date de JavaScript
   * @param mysqlTimestamp - Timestamp en formato MySQL (YYYY-MM-DD HH:MM:SS)
   * @returns Objeto Date de JavaScript
   */
  export const parseTimestamp = (mysqlTimestamp: string): Date => {
    return new Date(mysqlTimestamp.replace(' ', 'T') + 'Z');
  };