export interface Producto {
  id: number;
  text: string;
  id_categoria: number;
  id_supermercado: number;
  selected: boolean;
  done: boolean;
  amount: number;
  timestamp?: string; // Cambiado a string para manejar formato YYYY-MM-DD HH:MM:SS
}

export interface Categoria {
  id: number;
  text: string;
  bgColor: string;
  visible: boolean;
  timestamp?: string; // Cambiado a string para manejar formato YYYY-MM-DD HH:MM:SS
}

export interface Supermercado {
  id: number;
  text: string;
  logo: string;
  visible: boolean;
  order: number;
  timestamp?: string; // Cambiado a string para manejar formato YYYY-MM-DD HH:MM:SS
}

export interface LoginData {
  email: string;
  token: string;
  fingerID: string;
  logged: boolean;
}

export interface Tab {
  id: number;
  text: string;
  page: string;
  logo: string;
  selectable: boolean;
}

export interface ImportData {
  appName?: string;
  maxLenght?: number;
  defaultTabActive?: number;
  alturaDisponible?: number;
  fullScreen?: boolean;
  canClickProducts?: boolean;
  lastChangeTimestamp?: string; // Cambiado a string para manejar formato YYYY-MM-DD HH:MM:SS
  lastLoginTimestamp?: string; // Cambiado a string para manejar formato YYYY-MM-DD HH:MM:SS
  loginData: LoginData;
  supermercados?: Supermercado[];
  categorias?: Categoria[];
  productos?: Producto[];
}

export interface NotifyItemData {
  onClick?: () => void;
  buttonText?: string;
  buttonClass?: string;
  progressBarDuration?: number;
}
export interface NotifyItem {
  title: string;
  text: string;
  data?: NotifyItemData;
}

export interface MySelectOption {
  id: number;
  text: string;
  [key: string]: any;
}

/**
 * Interfaz para definir las propiedades de una tecla en el teclado virtual
 */
export interface KeyData {
  main?: string;
  upper?: string;
  position?: 'center' | 'end' | 'start';
  special?: string | string[];
  super?: string;
  type?: 'normal' | 'punctuation' | 'backspace' | 'shift' | 'special' | 'symbol' | 'emoji' | 'space' | 'enter' | 'letters' | 'numeric';
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