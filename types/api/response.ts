import type { Producto } from '../data/productos';
import type { Categoria } from '../data/categorias';
import type { Supermercado } from '../data/supermercados';
import type { LoginData } from '../auth/login';

export interface LoginResponse {
  result: boolean;
  token?: string;
  device?: {
    id: number;
    fingerID: string;
    is_master: number;
  };
  error_msg?: string;
}

export interface RegisterResponse {
  result: boolean;
  token?: string;
  error_msg?: string;
}

export interface ApiResponse<T = any> {
  result: boolean;
  error_msg?: string;
  data?: T;
}

export interface SyncDataResponse {
  loginData?: LoginData;
  categorias: Categoria[];
  supermercados: Supermercado[];
  productos: Producto[];
}