import type { Producto } from '../data/productos';
import type { Categoria } from '../data/categorias';
import type { Supermercado } from '../data/supermercados';

export enum SyncActionType {
  NEW_PRODUCT = 'NEW_PRODUCT',
  DELETE_PRODUCT = 'DELETE_PRODUCT',
  UPDATE_PRODUCT = 'UPDATE_PRODUCT',
  UPDATE_PRODUCT_AMOUNT = 'UPDATE_PRODUCT_AMOUNT',
  UPDATE_PRODUCT_DONE = 'UPDATE_PRODUCT_DONE',
  UPDATE_PRODUCT_SELECTED = 'UPDATE_PRODUCT_SELECTED',
  UPDATE_PRODUCT_TEXT = 'UPDATE_PRODUCT_TEXT',
  UPDATE_CATEGORY_TEXT = 'UPDATE_CATEGORY_TEXT',
  UPDATE_CATEGORY_VISIBLE = 'UPDATE_CATEGORY_VISIBLE',
  NEW_SUPERMARKET='NEW_SUPERMARKET',
  UPDATE_SUPERMARKET_ORDER = 'UPDATE_SUPERMARKET_ORDER',
  UPDATE_SUPERMARKET_VISIBLE = 'UPDATE_SUPERMARKET_VISIBLE',
}

export interface SyncAction {
  type: SyncActionType;
  payload: any;
  timestamp: number;
}

export interface QueueItem {
  id: string;
  method: string;
  url: string;
  data: any;
  timestamp: number;
  type: SyncActionType;
}

export interface SyncData {
  categorias: Categoria[];
  supermercados: Supermercado[];
  productos: Producto[];
  lastChangeTimestamp?: number;
}