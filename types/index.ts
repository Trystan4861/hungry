export interface Producto {
  id: number;
  text: string;
  id_categoria: number;
  id_supermercado: number;
  selected: boolean;
  done: boolean;
  amount: number;
}

export interface Categoria {
  id: number;
  text: string;
  bgColor: string;
  visible: boolean;
}

export interface Supermercado {
  id: number;
  text: string;
  logo: string;
  visible: boolean;
  order: number;
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
  lastChangeTimestamp?: number;
  lastLoginTimestamp?: number;
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