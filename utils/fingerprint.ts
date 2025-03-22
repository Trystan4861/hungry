/**
 * Funciones de utilidad para el manejo de fingerprints
 */

import * as FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * Convierte un string hexadecimal a un Uint8Array
 * @param hex String hexadecimal
 * @returns Uint8Array
 */
const hexToUint8Array = (hex: string): Uint8Array => 
  new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

/**
 * Convierte un Uint8Array a Base64 URL-safe
 * @param uint8Array Uint8Array
 * @returns String en formato Base64 URL-safe
 */
const uint8ArrayToBase64UrlSafe = (uint8Array: Uint8Array): string => 
  btoa(String.fromCharCode(...uint8Array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/**
 * Compacta un string hexadecimal a Base64 URL-safe
 * @param text String hexadecimal
 * @returns String compactado en formato Base64 URL-safe
 */
export const compactString = (text: string): string => 
  uint8ArrayToBase64UrlSafe(hexToUint8Array(text));

/**
 * Obtiene el fingerprint del dispositivo
 * @returns Promise con el fingerprint compactado
 */
export const getFingerprint = async (): Promise<string> => {
  try {
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();
    return compactString(result.visitorId);
  } catch (error) {
    console.error('Error al obtener fingerprint:', error);
    return '';
  }
};
