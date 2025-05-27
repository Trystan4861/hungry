import type { LoginCredentials, RegisterCredentials } from '~/types/api/credentials';
import type { LoginResponse, RegisterResponse, ApiResponse, SyncDataResponse } from '~/types/api/response';
import { SyncActionType, type SyncAction, type QueueItem, type SyncData } from '~/types/sync/sync';
import { getEnvVar } from '~/composables/useEnvVar';
import type { myStore as MyStoreType } from '~/composables/useStore';
import type { Producto } from '~/types';

/**
 * Clase principal del servicio API
 * Maneja todas las comunicaciones con el backend de Hungry
 */
export class ApiService {
  private store: ReturnType<typeof MyStoreType> | null = null;
  private baseUrl: string | null = null;
  private token: string | null = null;
  private isOnline: boolean = navigator.onLine;
  private processQueue: QueueItem[] = [];
  private readonly QUEUE_STORAGE_KEY = 'hungry_api_queue';

  constructor(baseUrl: string | null = null) {
    // Guardamos la URL base proporcionada, si existe
    this.baseUrl = baseUrl || this.getBaseUrl();

    // Inicializamos la cola y los listeners independientemente de la URL base
    // La URL base se obtendrá de forma diferida cuando sea necesaria
    this.initializeQueue();
    this.setupOnlineListener();
  }

  /**
   * Obtiene la URL base del API, inicializándola si es necesario
   * @returns La URL base del API
   */
  private getBaseUrl(): string | null {
    // Si ya tenemos una URL base, la devolvemos
    if (this.baseUrl) {
      return this.baseUrl;
    }

    // Si no tenemos URL base, intentamos obtenerla de las variables de entorno
    try {
      this.baseUrl = getEnvVar('NUXT_PUBLIC_API_URL');

      if (!this.baseUrl) {
        console.warn("La variable NUXT_PUBLIC_API_URL no está definida o es null");
      }
    } catch (error) {
      console.error("Error al obtener la URL base del API:", error);
    }

    return this.baseUrl;
  }

  /**
   * Inicializa la cola desde localStorage
   */
  private initializeQueue() {
    const savedQueue = localStorage.getItem(this.QUEUE_STORAGE_KEY)
    if (savedQueue) {
      this.processQueue = JSON.parse(savedQueue)
    }
    this.saveQueue()
  }

  /**
   * Configura los listeners para detectar cambios en la conexión
   */
  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processQueuedItems()
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  /**
   * Guarda la cola en localStorage
   */
  private saveQueue() {
    localStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(this.processQueue))
  }

  /**
   * Añade un item a la cola de procesos
   */
  private addToQueue(method: string, url: string, data: any) {
    if (!this.store) {
      console.error("ApiService: Store not initialized. Cannot add to queue.");
      // Optionally, you could throw an error or handle this situation differently,
      // but for now, logging and returning is a safe approach to prevent crashes.
      // Depending on application design, items might be queued in a temporary
      // place even before store is ready, or this situation is considered fatal.
      return; 
    }
    // Ensure the existing check for login status remains:
    if (!this.store.loginData.value.logged) return; 

    const queueItem: QueueItem = {
      id: Math.random().toString(36).substring(7),
      method,
      url,
      data,
      timestamp: Date.now(),
      type: data.type // Assuming data might have a 'type' property for sync actions
    }
    this.processQueue.push(queueItem)
    this.saveQueue()
  }

  /**
   * Procesa los items en cola cuando hay conexión
   */
  private async processQueuedItems() {
    if (!this.isOnline || this.processQueue.length === 0 || !this.token) return;

    const items = [...this.processQueue];
    this.processQueue = [];
    this.saveQueue();

    for (const item of items) {
      try {
        if (item.type) {
          await this.processSyncAction(item.data as SyncAction);
        } else {
          await this.makeRequest(item.method, item.url, item.data);
        }
      } catch (error) {
        this.processQueue.push(item);
        this.saveQueue();
        break;
      }
    }
  }

  /**
   * Wrapper para peticiones que gestiona el estado offline
   */
  private async makeRequest(method: string, url: string, data?: any): Promise<any> {
    if (!this.isOnline) {
      this.addToQueue(method, url, data)
      throw new Error('Dispositivo offline - Operación encolada')
    }

    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method,
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined
      })
      return response.json()
    } catch (error) {
      if (!navigator.onLine) {
        this.isOnline = false
        this.addToQueue(method, url, data)
        throw new Error('Conexión perdida - Operación encolada')
      }
      throw error
    }
  }

  /**
   * Configura el token para las peticiones autenticadas
   * @param token Token JWT para autenticación
   */
  setToken(token: string) {
    this.token = token
  }

  /**
   * Obtiene los headers necesarios para las peticiones autenticadas
   * @returns Headers con el token de autenticación si existe
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  public setStoreInstance(storeInstance: ReturnType<typeof MyStoreType>) {
    this.store = storeInstance;
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param credentials Datos de registro (email y contraseña)
   * @returns Respuesta con el token si el registro es exitoso y hay verificación automática
   *          o mensaje de verificación si requiere validación por email
   */
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    return this.makeRequest('POST', '/register', credentials)
  }

  /**
   * Realiza el login del usuario
   * @param credentials Credenciales del usuario (email, pass, fingerid opcional)
   * @returns Respuesta con el token y datos del dispositivo si el login es exitoso
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const data = await this.makeRequest('POST', '/login', credentials)
    if (data.result && data.token) {
      this.setToken(data.token)
    }
    return data
  }

  async getAllData(): Promise<ApiResponse<SyncDataResponse>> {
    return this.makeRequest('GET', '/getAll')
  }

  /**
   * Obtiene datos específicos sin sincronización automática
   * @param fingerid ID del dispositivo
   * @returns Datos del usuario incluyendo datos de login
   * @requires Autenticación
   */
  async getData(fingerid: string): Promise<ApiResponse<SyncDataResponse>> {
    return this.makeRequest('POST', '/getData', { fingerid })
  }

  /**
   * Sincroniza datos entre el cliente y el servidor
   * @param fingerid ID del dispositivo
   * @param data Datos a sincronizar (categorías, productos y supermercados)
   * @returns Datos actualizados del servidor
   * @requires Autenticación
   */
  async syncData(fingerid: string, data: SyncData): Promise<ApiResponse<SyncDataResponse>> {
    return this.makeRequest('POST', '/syncData', { fingerid, data })
  }

  /**
   * Obtiene las categorías del usuario
   * @returns Lista de categorías
   * @requires Autenticación
   */
  async getCategorias(): Promise<ApiResponse> {
    return this.makeRequest('GET', '/getCategorias')
  }

  /**
   * Actualiza el texto de una categoría
   * @param id_categoria ID de la categoría
   * @param text Nuevo texto para la categoría
   * @returns Resultado de la operación
   * @requires Autenticación
   */
  async updateCategoriaText(id_categoria: number, text: string): Promise<ApiResponse> {
    return this.makeRequest('POST', '/updateCategoriaText', { id_categoria, text })
  }

  /**
   * Actualiza la visibilidad de una categoría
   * @param id_categoria ID de la categoría
   * @param visible Estado de visibilidad (0=oculto, 1=visible)
   * @returns Resultado de la operación
   * @requires Autenticación
   */
  async updateCategoriaVisible(id_categoria: number, visible: number): Promise<ApiResponse> {
    return this.makeRequest('POST', '/updateCategoriaVisible', { id_categoria, visible })
  }

   /**
   * Actualiza la visibilidad de un supermercado
   * @param id_supermercado ID del supermercado
   * @param visible Estado de visibilidad (0=oculto, 1=visible)
   * @returns Resultado de la operación
   * @requires Autenticación
   */
    async updateSupermarketVisible(id_supermercado: number, visible: number): Promise<ApiResponse> {
      return this.makeRequest('POST', '/updateSupermercadoVisible', { id_supermercado, visible })
    }

   /**
   * Actualiza el orden de un supermercado
   * @param id_supermercado ID del supermercado
   * @param order Orden del supermercado
   * @returns Resultado de la operación
   * @requires Autenticación
   */
      async updateSupermarketOrder(id_supermercado: number, order: number): Promise<ApiResponse> {
      return this.makeRequest('POST', '/updateSupermercadoOrder', { id_supermercado, order })
    }

  /**
   * Crea un nuevo producto
   * @param data Datos del producto (categoría, supermercado, texto, cantidad opcional)
   * @returns ID del nuevo producto si se crea correctamente
   * @requires Autenticación
   */
  async newProducto(data: {
    id_categoria: number
    id_supermercado: number
    text: string
    amount?: number
  }): Promise<ApiResponse> {
    return this.makeRequest('POST', '/newProducto', data)
  }
  /**
   * Crea un nuevo supermercado
   * @param data Datos del supermercado (id, orden)
   * @returns Resultado de la operación
   * @requires Autenticación
   */
  async newSupermarket(data: {
    id: number
    order: number
  }): Promise<ApiResponse> {
    return this.makeRequest('POST', '/newSupermarket', data)
  }

  /**
   * Actualiza un producto existente
   * @param data Datos a actualizar del producto
   * @returns Resultado de la operación
   * @requires Autenticación
   */
  async updateProducto(data: {
    id_producto: number
    id_categoria?: number
    id_supermercado?: number
    text?: string
    amount?: number
    selected?: number
    done?: number
  }): Promise<ApiResponse> {
    return this.makeRequest('POST', '/updateProducto', data)
  }

  /**
   * Actualiza la cantidad de un producto
   * @param id_producto ID del producto
   * @param amount Nueva cantidad
   * @returns Resultado de la operación
   * @requires Autenticación
   */
  async updateProductoAmount(id_producto: number, amount: number): Promise<ApiResponse> {
    return this.makeRequest('POST', '/updateProductoAmount', { id_producto, amount })
  }

  /**
   * Actualiza el estado done de un producto
   * @param id_producto ID del producto
   * @param done Nuevo estado done
   * @returns Resultado de la operación
   * @requires Autenticación
   */
  async updateProductoDone(id_producto: number, done: number): Promise<ApiResponse> {
    return this.makeRequest('POST', '/updateProductoDone', { id_producto, done })
  }
  /**
   * Actualiza el estado selected de un producto
   * @param id_producto ID del producto
   * @param selected Nuevo estado selected
   * @returns Resultado de la operación
   * @requires Autenticación
   */
  async updateProductoSelected(id_producto: number, selected: number): Promise<ApiResponse> {
    return this.makeRequest('POST', '/updateProductoSelected', { id_producto, selected })
  }

  /**
   * Actualiza el nombre de un producto
   * @param id_producto ID del producto
   * @param text Nuevo nombre del producto
   * @returns Resultado de la operación
   * @requires Autenticación
   */
  async updateProductoText(id_producto: number, text: string): Promise<ApiResponse> {
    return this.makeRequest('POST', '/updateProductoText', { id_producto, text });
  }

  /**
   * Elimina un producto
   * @param id_producto ID del producto a eliminar
   * @returns Resultado de la operación
   * @requires Autenticación
   */
   async deleteProducto(id_producto: number): Promise<ApiResponse> {
     return this.makeRequest('POST', '/deleteProducto', { id_producto });
   }

  /**
   * Procesa una acción de sincronización
   * @param action Acción de sincronización a procesar
   * @returns Resultado de la operación
   */
  private async processSyncAction(action: SyncAction): Promise<ApiResponse> {
    switch (action.type) {
      case SyncActionType.NEW_PRODUCT:
        const newProductPayload = action.payload as Producto; // Assert payload type
        return this.newProducto({
          id_categoria: newProductPayload.id_categoria,
          id_supermercado: newProductPayload.id_supermercado,
          text: newProductPayload.text,
          amount: newProductPayload.amount
        });
      case SyncActionType.DELETE_PRODUCT:
        return this.deleteProducto(action.payload.id);
      case SyncActionType.UPDATE_PRODUCT:
        const updateProductPayload = action.payload as Partial<Producto> & { id: number }; // Assert payload type, ensure id is present
        return this.updateProducto({
          id_producto: updateProductPayload.id, // id_producto is the expected field name for this.updateProducto
          id_categoria: updateProductPayload.id_categoria,
          id_supermercado: updateProductPayload.id_supermercado,
          text: updateProductPayload.text,
          amount: updateProductPayload.amount,
          selected: typeof updateProductPayload.selected === 'boolean' ? (updateProductPayload.selected ? 1 : 0) : undefined,
          done: typeof updateProductPayload.done === 'boolean' ? (updateProductPayload.done ? 1 : 0) : undefined
        });
      case SyncActionType.UPDATE_PRODUCT_AMOUNT:
        return this.updateProductoAmount(
          action.payload.id,
          action.payload.amount
        );
      case SyncActionType.UPDATE_PRODUCT_DONE:
        return this.updateProductoDone(
          action.payload.id,
          action.payload.done ? 1 : 0
        );
      case SyncActionType.UPDATE_PRODUCT_SELECTED:
        return this.updateProductoSelected(
          action.payload.id,
          action.payload.selected ? 1 : 0
        );
      case SyncActionType.UPDATE_PRODUCT_TEXT:
        return this.updateProductoText(
          action.payload.id,
          action.payload.text
        );
      case SyncActionType.UPDATE_CATEGORY_TEXT:
        return this.updateCategoriaText(
          action.payload.id,
          action.payload.text
        );
      case SyncActionType.UPDATE_CATEGORY_VISIBLE:
        return this.updateCategoriaVisible(
          action.payload.id,
          action.payload.visible ? 1 : 0
        );
      case SyncActionType.NEW_SUPERMARKET:
        return this.newSupermarket({
          id: action.payload.id,
          order: action.payload.order
        });
      case SyncActionType.UPDATE_SUPERMARKET_ORDER:
        return this.updateSupermarketOrder(
          action.payload.id,
          action.payload.order
        );
      case SyncActionType.UPDATE_SUPERMARKET_VISIBLE:
        return this.updateSupermarketVisible(
          action.payload.id,
          action.payload.visible ? 1 : 0
        );
      default:
        throw new Error(`Tipo de acción no soportada: ${action.type}`);
    }
  }

  /**
   * Añade una acción de sincronización a la cola
   * @param action Acción de sincronización a añadir
   */
  addToSyncQueue(action: SyncAction) {
    if (!this.isOnline) {
      const queueItem: QueueItem = {
        id: Math.random().toString(36).substring(7),
        method: 'POST',
        url: '/sync',
        data: action,
        timestamp: Date.now(),
        type: action.type
      };
      this.processQueue.push(queueItem);
      this.saveQueue();
    } else {
      this.processSyncAction(action).catch(() => {
        const queueItem: QueueItem = {
          id: Math.random().toString(36).substring(7),
          method: 'POST',
          url: '/sync',
          data: action,
          timestamp: Date.now(),
          type: action.type
        };
        this.processQueue.push(queueItem);
        this.saveQueue();
      });
    }
  }

  /**
   * Obtiene el estado actual de la cola de procesos
   */
  getQueueStatus() {
    return {
      isOnline: this.isOnline,
      pendingItems: this.processQueue.length,
      queue: this.processQueue
    }
  }

  /**
   * Fuerza el procesamiento de la cola
   */
  async forceProcessQueue() {
    if (this.isOnline) {
      await this.processQueuedItems()
    }
  }
}

// En lugar de exportar una instancia directamente, creamos una función que devuelve la instancia
// Esto evita que useRuntimeConfig() se llame durante la carga del módulo
let apiServiceInstance: ApiService | null = null;

export default function getApiService(): ApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService();
  }
  return apiServiceInstance;
}