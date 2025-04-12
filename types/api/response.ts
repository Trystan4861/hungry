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
  loginData?: {
    email: string;
    token: string;
    fingerID: string;
    logged: boolean;
  };
  categorias: any[];
  supermercados: any[];
  productos: any[];
}