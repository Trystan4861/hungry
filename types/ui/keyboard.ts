/**
 * Interfaz para definir las propiedades de una tecla en el teclado virtual
 */
export interface KeyData {
  main?: string;
  upper?: string;
  position?: 'center' | 'end' | 'start';
  special?: string | string[];
  super?: string;
  type?: 'normal' | 'punctuation' | 'backspace' | 'shift' | 'special' | 'symbol' | 'emoji' | 'space' | 'enter' | 'letters' | 'numeric' | 'tab';
  text?: string;
  action?: string;
}

/**
 * Interfaz para definir una fila de teclas en el teclado virtual
 */
export interface KeyboardRow {
  id: string;
  position?: 'center' | 'end' | 'start';
  keys: KeyData[];
}

/**
 * Interfaz para definir la estructura completa del teclado virtual
 */
export interface KeyboardLayout {
  rows: KeyboardRow[];
}