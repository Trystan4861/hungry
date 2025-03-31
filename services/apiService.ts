import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { localStorageService } from '~/localStorageService';
import type { Producto, Categoria, Supermercado } from '~/types';

/**
 * apiService
 * Servicio para gestionar todas las comunicaciones con la API del backend
 * Proporciona métodos para autenticación, gestión de productos, categorías y supermercados
 */
class ApiService {
  private api: AxiosInstance;
  private baseURL: string;
  private pendingRequests: Array<{
    method: string;
    endpoint: string;
    data: any;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];
  private isOnline: boolean = true;

  constructor() {
    // URL base de la API
    this.baseURL = 'https://infoinnova.es/lolo/api';

    // Crear instancia de axios con configuración base
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Configurar interceptores
    this.setupInterceptors();

    // Cargar solicitudes pendientes del localStorage
    this.loadPendingRequests();

    // Configurar eventos de conexión
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      this.isOnline = navigator.onLine;
    }
  }

  /**
   * setupInterceptors
   * Configura los interceptores de axios para manejar tokens y errores
   */
  private setupInterceptors(): void {
    // Interceptor de solicitudes
    this.api.interceptors.request.use(
      (config) => {
        // Obtener token del localStorage
        const loginData = localStorageService.getSubItem('loginData');
        if (loginData && loginData.token) {
          config.headers['Authorization'] = `Bearer ${loginData.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor de respuestas
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: unknown) => {
        const axiosError = error as {
          response?: { status: number },
          config?: { method: string; url: string; data: any }
        };

        // Manejar errores de red o servidor
        if (!axiosError.response) {
          // Error de red o servidor no disponible
          this.isOnline = false;

          // Si hay una promesa de solicitud, la guardamos para reintentarla cuando haya conexión
          if (axiosError.config) {
            const { method, url, data } = axiosError.config;
            return new Promise((resolve, reject) => {
              this.addPendingRequest(method, url.replace(this.baseURL, ''), data, resolve, reject);
            });
          }
        } else if (axiosError.response?.status === 401) {
          // Token inválido o expirado
          localStorageService.setSubItem('loginData', { email: '', token: '', fingerID: '', logged: false });
          // Redirigir a login o mostrar mensaje
          console.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * addPendingRequest
   * Añade una solicitud a la cola de pendientes para reintentarla cuando haya conexión
   * @param method - Método HTTP (get, post, etc.)
   * @param endpoint - Endpoint de la API
   * @param data - Datos de la solicitud
   * @param resolve - Función para resolver la promesa
   * @param reject - Función para rechazar la promesa
   */
  private addPendingRequest(
    method: string,
    endpoint: string,
    data: any,
    resolve: (value: any) => void,
    reject: (reason: any) => void
  ): void {
    this.pendingRequests.push({ method, endpoint, data, resolve, reject });
    this.savePendingRequests();
  }

  /**
   * savePendingRequests
   * Guarda las solicitudes pendientes en localStorage
   */
  private savePendingRequests(): void {
    const requests = this.pendingRequests.map(({ method, endpoint, data }) => ({
      method,
      endpoint,
      data
    }));
    localStorageService.setItem('pendingRequests', JSON.stringify(requests));
  }

  /**
   * loadPendingRequests
   * Carga las solicitudes pendientes desde localStorage
   */
  private loadPendingRequests(): void {
    const requestsStr = localStorageService.getItem('pendingRequests');
    if (!requestsStr) return;

    try {
      const requests = JSON.parse(requestsStr as string) || [];
      for (const request of requests) {
        this.pendingRequests.push({
          ...request,
          resolve: () => {},
          reject: () => {}
        });
      }
    } catch (error) {
      console.error('Error al cargar solicitudes pendientes:', error);
    }
  }

  /**
   * handleOnline
   * Maneja el evento de conexión recuperada
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.processPendingRequests();
  }

  /**
   * handleOffline
   * Maneja el evento de pérdida de conexión
   */
  private handleOffline(): void {
    this.isOnline = false;
  }

  /**
   * processPendingRequests
   * Procesa las solicitudes pendientes cuando se recupera la conexión
   */
  private async processPendingRequests(): Promise<void> {
    if (!this.isOnline || this.pendingRequests.length === 0) return;

    const requests = [...this.pendingRequests];
    this.pendingRequests = [];
    this.savePendingRequests();

    for (const request of requests) {
      try {
        const { method, endpoint, data, resolve, reject } = request;
        let response;

        // Usar el método correcto según el tipo de solicitud
        if (method.toLowerCase() === 'get') {
          response = await this.api.get(endpoint, { params: data });
        } else if (method.toLowerCase() === 'post') {
          response = await this.api.post(endpoint, data);
        } else if (method.toLowerCase() === 'put') {
          response = await this.api.put(endpoint, data);
        } else if (method.toLowerCase() === 'delete') {
          response = await this.api.delete(endpoint, { data });
        }
        if (response) {
          resolve(response.data);
        } else {
          reject(new Error(`No se pudo procesar la solicitud ${method} ${endpoint}`));
        }
      } catch (error: unknown) {
        console.error(`Error al procesar solicitud pendiente:`, error);
        request.reject(error);
        // Si sigue siendo un error de conexión, volvemos a añadir la solicitud a la cola
        const axiosError = error as { response?: any };
        if (!axiosError.response) {
          this.pendingRequests.push(request);
          this.savePendingRequests();
        }
      }
    }
  }

  /**
   * login
   * Inicia sesión en la API
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario (ya debe estar en MD5)
   * @param fingerID - ID de huella digital del dispositivo
   * @returns Respuesta de la API con token si es exitoso
   */
  async login(email: string, password: string, fingerID: string): Promise<any> {
    try {
      const response = await this.api.post('/login', {
        email,
        pass: password,
        fingerID
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * register
   * Registra un nuevo usuario en la API
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario (ya debe estar en MD5)
   * @param fingerID - ID de huella digital del dispositivo
   * @returns Respuesta de la API con token si es exitoso
   */
  async register(email: string, password: string, fingerID: string): Promise<any> {
    try {
      const response = await this.api.post('/register', {
        email,
        pass: password,
        fingerID
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * getAll
   * Obtiene todos los datos del usuario (productos, categorías, supermercados)
   * @returns Respuesta de la API con todos los datos
   */
  async getAll(): Promise<any> {
    try {
      const response = await this.api.get('/getAll');
      return response.data;
    } catch (error: unknown) {
      console.error('Error al obtener datos:', error);
      throw error;
    }
  }

  /**
   * newProducto
   * Crea un nuevo producto en la API
   * @param producto - Datos del producto a crear
   * @returns Respuesta de la API con el producto creado
   */
  async newProducto(producto: Partial<Producto>): Promise<any> {
    try {
      const response = await this.api.post('/newProducto', producto);
      return response.data;
    } catch (error: unknown) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  }

  /**
   * updateProducto
   * Actualiza un producto existente en la API
   * @param producto - Datos del producto a actualizar
   * @returns Respuesta de la API con el producto actualizado
   */
  async updateProducto(producto: Partial<Producto>): Promise<any> {
    try {
      const response = await this.api.post('/updateProducto', {
        id_producto: producto.id,
        text: producto.text,
        id_categoria: producto.id_categoria,
        id_supermercado: producto.id_supermercado,
        amount: producto.amount,
        selected: producto.selected ? 1 : 0,
        done: producto.done ? 1 : 0
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  /**
   * deleteProducto
   * Elimina un producto de la API
   * @param id - ID del producto a eliminar
   * @returns Respuesta de la API
   */
  async deleteProducto(id: number): Promise<any> {
    try {
      const response = await this.api.post('/deleteProducto', {
        id_producto: id
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

  /**
   * updateCategoriaText
   * Actualiza el texto de una categoría
   * @param id - ID de la categoría
   * @param text - Nuevo texto para la categoría
   * @returns Respuesta de la API
   */
  async updateCategoriaText(id: number, text: string): Promise<any> {
    try {
      const response = await this.api.post('/updateCategoriaText', {
        id_categoria: id,
        text
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error al actualizar texto de categoría:', error);
      throw error;
    }
  }

  /**
   * updateCategoriaVisible
   * Actualiza la visibilidad de una categoría
   * @param id - ID de la categoría
   * @param visible - Estado de visibilidad (true/false)
   * @returns Respuesta de la API
   */
  async updateCategoriaVisible(id: number, visible: boolean): Promise<any> {
    try {
      const response = await this.api.post('/updateCategoriaVisible', {
        id_categoria: id,
        visible: visible ? 1 : 0
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error al actualizar visibilidad de categoría:', error);
      throw error;
    }
  }

  /**
   * setSupermercadosOcultos
   * Establece los supermercados ocultos para el usuario
   * @param ids - Array de IDs de supermercados a ocultar
   * @returns Respuesta de la API
   */
  async setSupermercadosOcultos(ids: number[]): Promise<any> {
    try {
      const response = await this.api.post('/setSupermercadosOcultos', {
        supermercados_ocultos: ids
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error al establecer supermercados ocultos:', error);
      throw error;
    }
  }

  /**
   * syncData
   * Sincroniza los datos del usuario con el servidor
   * @param email - Correo electrónico del usuario
   * @param token - Token de autenticación
   * @param fingerID - ID de huella digital del dispositivo
   * @param data - Datos a sincronizar
   * @returns Respuesta de la API con los datos sincronizados
   */
  async syncData(email: string, token: string, fingerID: string, data: Record<string, unknown>): Promise<any> {
    try {
      const response = await this.api.post('/syncData', {
        email,
        token,
        fingerID,
        data
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error en sincronización:', error);
      throw error;
    }
  }
}

// Exportar una instancia única del servicio
export const apiService = new ApiService();