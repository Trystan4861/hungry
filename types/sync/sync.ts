export enum SyncActionType {
  UPDATE_PRODUCT_AMOUNT = 'UPDATE_PRODUCT_AMOUNT',
  UPDATE_PRODUCT_DONE = 'UPDATE_PRODUCT_DONE',
  UPDATE_PRODUCT_SELECTED = 'UPDATE_PRODUCT_SELECTED',
  UPDATE_PRODUCT_TEXT = 'UPDATE_PRODUCT_TEXT',
  UPDATE_CATEGORY_TEXT = 'UPDATE_CATEGORY_TEXT',
  UPDATE_CATEGORY_VISIBLE = 'UPDATE_CATEGORY_VISIBLE',
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
  categorias: any[];
  supermercados: any[];
  productos: any[];
}