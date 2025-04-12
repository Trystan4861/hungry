export interface Categoria {
  id: number;
  text: string;
  bgColor: string;
  visible: boolean;
  timestamp?: string; // Formato MySQL YYYY-MM-DD H:i:s
}