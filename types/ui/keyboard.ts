/**
 * Tipos para el teclado virtual
 */
export type KeyType = 'normal' | 'punctuation' | 'backspace' | 'shift' | 'special' | 'symbol' | 'emoji' | 'space' | 'enter' | 'letters' | 'numeric' | 'tab';
export type KeyPosition = 'center' | 'end' | 'start';

/**
 * Interfaz para definir las propiedades de una tecla en el teclado virtual
 */
export interface KeyData {
  main?: string;
  upper?: string;
  position?: KeyPosition;
  special?: string | string[];
  super?: string;
  type?: KeyType;
  text?: string;
  action?: string;
}

/**
 * Interfaz para definir una fila de teclas en el teclado virtual
 */
export interface KeyboardRow {
  id: string;
  position?: KeyPosition;
  keys: KeyData[];
}

/**
 * Interfaz para definir la estructura completa del teclado virtual
 */
export interface KeyboardLayout {
  rows: KeyboardRow[];
}

export interface EmojiCategory {
  icon: string;
  name: string;
  emojis: string[];
}

export interface KeyboardConfig {
  layout: KeyboardLayout;
  emojiCategories: EmojiCategory[];
}