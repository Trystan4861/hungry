import type { LoginData } from '../auth/login';
import type { Categoria } from '../data/categorias';
import type { Supermercado } from '../data/supermercados';
import type { Producto } from '../data/productos';

export interface ImportData {
  appName?: string;
  maxLenght?: number;
  defaultTabActive?: number;
  alturaDisponible?: number;
  fullScreen?: boolean;
  loginData?: LoginData;
  categorias?: Categoria[];
  supermercados?: Supermercado[];
  productos?: Producto[];
  lastChangeTimestamp?: number;
}