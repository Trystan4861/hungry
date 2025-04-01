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