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
  progressBarDuration?: number;
}
export interface NotifyItem {
  title: string;
  text: string;
  data?: NotifyItemData;
}