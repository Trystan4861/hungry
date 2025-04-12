export interface Producto {
  id: number;
  text: string;
  id_categoria: number;
  id_supermercado: number;
  amount: number;
  selected: boolean;
  done: boolean;
  timestamp?: string; // Formato MySQL YYYY-MM-DD H:i:s
}