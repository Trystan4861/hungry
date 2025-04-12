export interface Supermercado {
  id: number;
  text: string;
  logo: string;
  visible: boolean;
  order: number;
  timestamp?: string; // Formato MySQL YYYY-MM-DD H:i:s
}