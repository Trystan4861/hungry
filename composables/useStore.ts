import type { Producto, Categoria, LoginData, Supermercado, ImportData, Tab, SyncData, SyncDataResponse } from '~/types';
import { localStorageService } from '~/services/localStorageService'; // Import the localStorageService
import getApiService from '~/services/apiService'
import { SyncActionType, type SyncAction } from '~/types/sync/sync'

export const myStore = () => {
  const apiService = getApiService();
  let syncIntervalId: ReturnType<typeof setInterval> | null = null;
  const tabs: Tab[] = [
    { id: 0, text: 'Configuración',          page: 'config', logo: 'config.svg',        selectable: false,  },
    { id: 1, text: 'Añadir Productos',       page: 'add',    logo: 'add.svg',           selectable: true,   },
    { id: 2, text: 'Por orden alfabético',   page: 'a2z',    logo: 'a2z.svg',           selectable: true,   },
    { id: 3, text: 'Por categoría',          page: 'categorias', logo: 'categorias.svg',    selectable: true,   },
    { id: 4, text: 'Lista de la compra',     page: 'cart',   logo: 'cart.svg',          selectable: true,   },
  ];
  const bgColors = [
    "#d83c3d", "#d8993c", "#b9d83c", "#5bd83c", "#3dd87a", "#47ffff",
    "#3b7ad7", "#5b3cd8", "#b83cd8", "#d83ba4", "#6f1918", "#704c1a",
    "#5d6f19", "#2b6f18", "#1f8448", "#196f70", "#183c6e", "#2c186f",
    "#5e186e", "#6e1952"
  ];
  const lastSyncTimestamp = useState<number | null>('lastSyncTimestamp', () => Date.now());
  const productos = useState<Producto[]>('productos', () => []);
  const supermercados = useState<Supermercado[]>('supermercados', () => [
    { id: 0, text: 'Cualquier Supermercado', logo: 'hungry.svg',        visible: true, order: 0, timestamp:"0000-00-00 00:00:00" },
    { id: 1, text: 'Carrefour',              logo: 'carrefour.svg',     visible: true, order: 1, timestamp:"0000-00-00 00:00:00" },
    { id: 2, text: 'Mercadona',              logo: 'mercadona.svg',     visible: true, order: 2, timestamp:"0000-00-00 00:00:00" },
    { id: 3, text: 'La Carmela',             logo: 'super_carmela.svg', visible: true, order: 3, timestamp:"0000-00-00 00:00:00" },
   ]);


  const loginData = useState<LoginData>('loginData', () => ({ email: '', token: '', fingerID: '', logged: false }));
  const categorias = useState<Categoria[]>('categorias', () => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    text: `Categoría ${String(i).padStart(2, '0')}`,
    bgColor: bgColors[i],
    visible: true,
    timestamp: "0000-00-00 00:00:00" // Cambiado a string para manejar formato YYYY-MM-DD HH:MM:SS
  })));

  const epochTime = "1980-05-21 16:25:00";
  const now= computed(() => new Date().toLocaleString('sv-SE').replace('T', ' '))

  const findProducto = (id: number) => productos.value.find(p => p.id === id);
  const findSupermercado = (id: number) => supermercados.value.find(m => m.id === id);
  const findCategoria = (id: number) => categorias.value.find(c => c.id === id);

  /**
   * sortSupermercadosByOrder
   * Ordena los supermercados según su propiedad 'order'
   * @returns {Supermercado[]} Array ordenado de supermercados
   */
  const sortSupermercadosByOrder = () => {
    // Crear una copia ordenada de los supermercados
    const ordenados = [...supermercados.value].sort((a, b) => {
      // El supermercado genérico (id=0) siempre va primero
      if (a.id === 0) return -1;
      if (b.id === 0) return 1;
      // Ordenar el resto por la propiedad 'order'
      return a.order - b.order;
    });

    // Actualizar el array de supermercados con la versión ordenada
    supermercados.value = ordenados;

    // Devolver el array ordenado para facilitar su uso en otros contextos
    return ordenados;
  };

  const exportData = () => {
    // Ordenar los supermercados por la propiedad 'order' antes de exportarlos
    sortSupermercadosByOrder();

    // Recopilamos todos los datos en un único objeto
    const data = {
      appName: appName.value,
      maxLenght: maxLenght.value,
      defaultTabActive: defaultTabActive.value,
      alturaDisponible: alturaDisponible.value,
      fullScreen: fullScreen.value,
      // No incluimos loginData en los datos a sincronizar
      categorias: categorias.value,
      supermercados: supermercados.value,
      productos: productos.value,
      // Añadimos timestamp para comparaciones de sincronización
      lastChangeTimestamp: Date.now()
    };

    return data;
  };

  const importData = (data: ImportData) => {
    try {
      // Importamos los datos a las variables reactivas
      // Verificar si el usuario está logueado y si los datos son del mismo usuario
      if (data.loginData) {
        // Si estamos logueados y los datos son del mismo usuario, mantenemos los datos de login actuales
        if (loginData.value.logged &&
            data.loginData.email === loginData.value.email) {
          // No hacemos nada, mantenemos los datos de login actuales
        } else {
          // Si no estamos logueados o los datos son de otro usuario, usamos los datos importados
          loginData.value = data.loginData;
        }
      }

      if (data.categorias) {
          //si alguna de las categorias importadas no tiene timestamp, se lo añadimos con el valor defalt a dicha categoría
          data.categorias.forEach((categoria: Categoria) => {
            if (!categoria.timestamp) {
              categoria.timestamp = epochTime;
            }
          });

        categorias.value = data.categorias;
      }
      if (data.supermercados) {
          //si algun supermercado importado no tiene timestamp, se lo añadimos con el valor defalt a dicho supermercado
          data.supermercados.forEach((supermercado: Supermercado) => {
            if (!supermercado.timestamp) {
              supermercado.timestamp = epochTime;
            }
          });

        supermercados.value = data.supermercados;
        // Ordenar los supermercados por la propiedad 'order'
        sortSupermercadosByOrder();
      }
      if (data.productos) {
        //si algun producto importado no tiene timestamp, se lo añadimos con el valor defalt a dicho producto
        data.productos.forEach((producto: Producto) => {
          if (!producto.timestamp) {
            producto.timestamp = epochTime;
          }
        });
        // Usar updateProductos en lugar de asignar directamente
        updateProductos(data.productos);
        return true; // Salir temprano ya que updateProductos ya guarda en localStorage
      }

      // Si hay otros datos en el objeto importado, también los importamos
      if ('defaultTabActive' in data && typeof data.defaultTabActive === 'number') {
        defaultTabActive.value = data.defaultTabActive;
      }
      if ('fullScreen' in data && typeof data.fullScreen === 'boolean') {
        fullScreen.value = data.fullScreen;
      }
      if ('appName' in data && typeof data.appName === 'string') {
        appName.value = data.appName;
      }
      if ('maxLenght' in data && typeof data.maxLenght === 'number') {
        maxLenght.value = data.maxLenght;
      }
      if ('alturaDisponible' in data && typeof data.alturaDisponible === 'number') {
        alturaDisponible.value = data.alturaDisponible;
      }

      // Guardamos los datos importados en localStorage
      localStorageService.importData(data);

      return true;
    } catch (error) {
      console.error('Error al importar datos:', error);
      return false;
    }
  };

  const loadDataFromLocalStorage = () => {
    try {
      // Primero intentamos migrar datos antiguos si existen
      localStorageService.migrateOldData();

      // Intentamos cargar los datos completos primero
      const completeData = localStorageService.getItem();
      if (completeData && typeof completeData === 'object') {
        // Si los datos están en el formato completo, los importamos directamente
        importData(completeData);
        return;
      }

      // Si no hay datos completos, cargamos los datos por subitems
      // Validación para productos
      const storedProductos = localStorageService.getSubItem('productos');
      if (storedProductos && Array.isArray(storedProductos)) {
        // Validar que cada producto tiene la estructura correcta
        const validProductos = storedProductos.filter(p =>
          p && typeof p === 'object' &&
          typeof p.id === 'number' &&
          typeof p.text === 'string' &&
          typeof p.id_categoria === 'number'
        );
        if (validProductos.length === storedProductos.length) {
          // Usar updateProductos en lugar de asignar directamente
          // Pero no llamamos a updateProductos aquí para evitar guardar en localStorage innecesariamente
          productos.value = storedProductos;
        } else {
          console.warn('Algunos productos en localStorage no tienen el formato correcto');
        }
      }

      // Validación para supermercados
      const storedSupermercados = localStorageService.getSubItem('supermercados');
      if (storedSupermercados && Array.isArray(storedSupermercados)) {
        // Validar que cada supermercado tiene la estructura correcta
        const validSupermercados = storedSupermercados.filter(s =>
          s && typeof s === 'object' &&
          typeof s.id === 'number' &&
          typeof s.text === 'string' &&
          typeof s.visible === 'boolean'
        );
        if (validSupermercados.length === storedSupermercados.length) {
          supermercados.value = validSupermercados;
          // Ordenar los supermercados por la propiedad 'order'
          sortSupermercadosByOrder();
        } else {
          console.warn('Algunos supermercados en localStorage no tienen el formato correcto');
        }
      }

      // Validación para categorías
      const storedCategorias = localStorageService.getSubItem('categorias');
      if (storedCategorias && Array.isArray(storedCategorias)) {
        // Validar que cada categoría tiene la estructura correcta
        const validCategorias = storedCategorias.filter(c =>
          c && typeof c === 'object' &&
          typeof c.id === 'number' &&
          typeof c.text === 'string' &&
          typeof c.bgColor === 'string' &&
          typeof c.visible === 'boolean'
        );
        if (validCategorias.length === storedCategorias.length) {
          categorias.value = storedCategorias;
        } else {
          console.warn('Algunas categorías en localStorage no tienen el formato correcto');
        }
      }

      // Validación para loginData
      const storedLoginData = localStorageService.getSubItem('loginData');
      if (storedLoginData && typeof storedLoginData === 'object') {
        // Validar que loginData tiene la estructura correcta
        if (
          typeof storedLoginData.email === 'string' &&
          typeof storedLoginData.token === 'string' &&
          typeof storedLoginData.fingerID === 'string' &&
          typeof storedLoginData.logged === 'boolean'
        ) {
          loginData.value = storedLoginData;
        } else {
          console.warn('LoginData en localStorage no tiene el formato correcto');
        }
      }

      // Cargar defaultTabActive
      const storedDefaultTabActive = localStorageService.getSubItem('defaultTabActive');
      if (storedDefaultTabActive !== null && typeof storedDefaultTabActive === 'number') {
        defaultTabActive.value = storedDefaultTabActive;
      }

      // Cargar fullScreen
      const storedFullScreen = localStorageService.getSubItem('fullScreen');
      if (storedFullScreen !== null && typeof storedFullScreen === 'boolean') {
        fullScreen.value = storedFullScreen;
      }

    } catch (error) {
      console.error('Error al cargar datos desde localStorage:', error);
      // En caso de error, podríamos limpiar el localStorage para evitar futuros problemas
      // localStorageService.removeItem();
    }
  };

  const updateLoginData = (newData: Partial<LoginData>) => {
    Object.assign(loginData.value, newData);
    saveDataToLocalStorage();
  };

  const saveDataToLocalStorage = (ignoreSort:boolean=false) => {
    // Ordenar los supermercados por la propiedad 'order' antes de guardarlos
    if (!ignoreSort) sortSupermercadosByOrder();

    localStorageService.setSubItem('productos', productos.value);
    localStorageService.setSubItem('supermercados', supermercados.value);
    localStorageService.setSubItem('categorias', categorias.value);
    localStorageService.setSubItem('loginData', loginData.value);
    localStorageService.setSubItem('defaultTabActive', defaultTabActive.value);
    localStorageService.setSubItem('fullScreen', fullScreen.value);
    localStorageService.setSubItem('lastSyncTimestamp', lastSyncTimestamp.value);
  };

  const addProduct = (name: string,category_id:number,supermarket_id:number) => {
    const newItem: Producto = {
      id: productos.value.length > 0 ? Math.max(...productos.value.map(p => p.id)) + 1 : 0,
      text: name.trim(),
      id_categoria: category_id,
      id_supermercado: supermarket_id,
      selected: false,
      done: false,
      amount: 1
    };
    productos.value.push(newItem);
    apiService.addToSyncQueue({
      type: SyncActionType.NEW_PRODUCT,
      payload: newItem,
      timestamp: Date.now()
    });
    saveDataToLocalStorage();
  };

  const updateLastSyncTimestamp = () => {
    lastSyncTimestamp.value = Date.now();
    saveDataToLocalStorage();
  }

  const updateProduct = (id: number, newData: Partial<Producto>) => {
    const producto = findProducto(id);
    if (producto) {
      Object.assign(producto, newData);
      if (loginData.value.logged) {
        apiService.addToSyncQueue({
          type: SyncActionType.UPDATE_PRODUCT,
          payload: newData,
          timestamp: Date.now()
        });
      }
      saveDataToLocalStorage();
    }
  };

  const updateCategoria = (id: number, newText: string) => {
    const categoria = findCategoria(id);
    if (categoria) {
      categoria.text = newText;
      apiService.addToSyncQueue({
        type: SyncActionType.UPDATE_CATEGORY_TEXT,
        payload: {
            id_categoria:id,
            text: newText
        },
        timestamp: Date.now()
      });
      saveDataToLocalStorage();
    }
  };

  const updateCategorias = (visibleCategoriaIds: number[]) => {
    categorias.value.forEach(categoria => {
      const wasVisible= categoria.visible;
      const newVisible= visibleCategoriaIds.includes(categoria.id);
      if (loginData.value.logged && wasVisible != newVisible){
        apiService.addToSyncQueue({
          type: SyncActionType.UPDATE_CATEGORY_VISIBLE,
          payload: {
              id_categoria:categoria.id,
              visible:newVisible
          },
          timestamp: Date.now()
        });
        categoria.visible = newVisible;
      }
    });
    saveDataToLocalStorage();
  };

  const setVisibleCategoria = (id: number, visible: boolean) => {
    const categoria = findCategoria(id);
    if (categoria) {
      categoria.visible = visible;
      apiService.addToSyncQueue({
        type: SyncActionType.UPDATE_CATEGORY_VISIBLE,
        payload: {
            id_categoria:id,
            visible: visible ? 1 : 0
        },
        timestamp: Date.now()
      });
      saveDataToLocalStorage();
    }
  };

  const setAmount = (id: number, amount: number) => {
    const producto = findProducto(id);
    if (producto) {
      producto.amount = amount;
      apiService.addToSyncQueue({
        type: SyncActionType.UPDATE_PRODUCT_AMOUNT,
        payload: {
          id,
          amount
        },
        timestamp: Date.now()
      });
      saveDataToLocalStorage();
    }
  };

  const toggleSelected = (id: number) => {
      const producto = findProducto(id);
      if (producto) {
        // Crear una copia de todos los productos
        const newProductos = [...productos.value];
        // Encontrar el producto en la copia y actualizarlo
        const index = newProductos.findIndex(p => p.id === id);
        if (index !== -1) {
          const newSelected = !newProductos[index].selected;
          const timestamp = new Date().toLocaleString('sv-SE').replace('T', ' ');

          newProductos[index] = {
            ...newProductos[index],
            selected: newSelected,
            done: newSelected ? false : newProductos[index].done,
            timestamp
          };

          // Actualizar todos los productos usando la función centralizada
          updateProductos(newProductos);
        }
      }
  };

  const toggleDone = (id: number) => {
    const producto = findProducto(id);
    if (producto) {
      producto.done = !producto.done;
      apiService.addToSyncQueue({
        type: SyncActionType.UPDATE_PRODUCT_DONE,
        payload: {
          id,
          done: producto.done
        },
        timestamp: Date.now()
      });
      saveDataToLocalStorage();
    }
  };

  const updateProductText = (id: number, text: string) => {
    const producto = findProducto(id);
    if (producto) {
      producto.text = text;
      apiService.addToSyncQueue({
        type: SyncActionType.UPDATE_PRODUCT_TEXT,
        payload: {
          id,
          text
        },
        timestamp: Date.now()
      });
      saveDataToLocalStorage();
    }
  };

  const updateCategoryText = (id: number, text: string) => {
    const categoria = findCategoria(id);
    if (categoria) {
      categoria.text = text;
      apiService.addToSyncQueue({
        type: SyncActionType.UPDATE_CATEGORY_TEXT,
        payload: {
          id,
          text
        },
        timestamp: Date.now()
      });
      saveDataToLocalStorage();
    }
  };

  const updateCategoryVisible = (id: number, visible: boolean) => {
    const categoria = findCategoria(id);
    if (categoria) {
      categoria.visible = visible;
      apiService.addToSyncQueue({
        type: SyncActionType.UPDATE_CATEGORY_VISIBLE,
        payload: {
          id,
          visible
        },
        timestamp: Date.now()
      });
      saveDataToLocalStorage();
    }
  };

  const setEmail = (email: string) => {
    loginData.value.email = email;
    saveDataToLocalStorage();
  };

  const setToken = (token: string) => {
    loginData.value.token = token;
    saveDataToLocalStorage();
  };

  const setFingerID = (fingerID: string) => {
    loginData.value.fingerID = fingerID;
    saveDataToLocalStorage();
  };

  const setLogged = (logged: boolean) => {
    loginData.value.logged = logged;
    saveDataToLocalStorage();
  };

  const sortedA2Z = computed(() => {
    // Obtener IDs de categorías visibles
    const visibleCategoriaIds = categorias.value
      .filter(cat => cat.visible)
      .map(cat => cat.id);

    // Filtrar productos por categorías visibles y luego ordenar alfabéticamente
    return [...productos.value]
      .filter(producto => visibleCategoriaIds.includes(producto.id_categoria))
      .sort((a, b) => a.text.localeCompare(b.text));
  });

  const sortedByCategory = computed(() => {
    // Obtener IDs de categorías visibles
    const visibleCategoriaIds = categorias.value
      .filter(cat => cat.visible)
      .map(cat => cat.id);

    // Filtrar productos por categorías visibles y luego ordenar por categoría y alfabéticamente
    return [...productos.value]
      .filter(producto => visibleCategoriaIds.includes(producto.id_categoria))
      .sort((a, b) => a.id_categoria - b.id_categoria || a.text.localeCompare(b.text));
  });

  const purchased = computed(() => {
    // Obtener IDs de categorías visibles
    const visibleCategoriaIds = categorias.value
      .filter(cat => cat.visible)
      .map(cat => cat.id);

    // Filtrar productos comprados (done) y que pertenezcan a categorías visibles
    return productos.value
      .filter(p => p.done && visibleCategoriaIds.includes(p.id_categoria));
  });

  const clearList = (onlyDone: boolean) => {
    productos.value.forEach(p => {

      if ((onlyDone && p.done) || (!onlyDone && p.selected)) {
        p.selected = false;
        apiService.addToSyncQueue({
          type: SyncActionType.UPDATE_PRODUCT_SELECTED,
          payload: {
              id:p.id,
              selected: 0
          },
          timestamp: Date.now()
        });
        p.done = false;
        apiService.addToSyncQueue({
          type: SyncActionType.UPDATE_PRODUCT_DONE,
          payload: {
              id:p.id,
              done: 0
          },
          timestamp: Date.now()
        });
      }
    });
    saveDataToLocalStorage();
  };

  /**
   * TODO:
   *  - Implementar esta funcionabilidad tanto en el backend como en el frontend.
   *   - Needs:
   *    - Obtener supermercados nuevos no asociados al usario actual.
   *    - Selección de nuevos supermercados por parte del usuario. (NEW_COMPONENT??)
   *   - Sincronización de los nuevos supermercados con el servidor.
   */
   /**
   * addMarket
   * Agrega un nuevo supermercado al almacenamiento local y lo muestra en la interfaz de usuario.
   *
   * @param market Objeto Supermercado que contiene información sobre el nuevo supermercado.
   */
  const addMarket = (market: Supermercado) => {
    const maxOrder = supermercados.value.length;
    supermercados.value.push({ ...market, order: maxOrder });
    apiService.addToSyncQueue({
      type: SyncActionType.NEW_SUPERMARKET,
      payload: {
        id:market.id,
        order: maxOrder
      },
      timestamp: Date.now()
    });
    // Ordenar los supermercados por la propiedad 'order'
    saveDataToLocalStorage();
  };

  const setMarketVisible = (id: number, visible: boolean, save:boolean=true) => {
    const index = supermercados.value.findIndex(market => market.id === id);
    if (index<0) return;
    else{
      supermercados.value[index].visible = visible;
      // Ordenar los supermercados por la propiedad 'order'
      apiService.addToSyncQueue({
        type: SyncActionType.UPDATE_SUPERMARKET_VISIBLE,
        payload: {
          id,
          visible: visible ? 1:0
        },
        timestamp: Date.now()
      });
      if (save) saveDataToLocalStorage();
    }
  };

  /**
   * updateSupermercados
   * Actualiza la visibilidad de los supermercados y mantiene su orden
   * @param visibleSupermercadoIds IDs de los supermercados que deben estar visibles
   */
  const updateSupermercados = (visibleSupermercadoIds: number[]) => {
    // Actualizar la visibilidad de los supermercados
    supermercados.value.forEach(supermercado => {
      const wasVisible = supermercado.visible;
      const newVisible = visibleSupermercadoIds.includes(supermercado.id);
      if (wasVisible !== newVisible){
        setMarketVisible(supermercado.id, newVisible,false);
      }
    });
    saveDataToLocalStorage();
  };

  const setMarketOrder = (id: number, directionUp: boolean) => {
    const index = supermercados.value.findIndex(m => m.id === id);
    if (index === -1 || index === 0) return;

    const currentMarket = supermercados.value[index];
    const swapIndex = directionUp ? index - 1 : index + 1;
    if (swapIndex < 1 || swapIndex >= supermercados.value.length) return;

    const targetMarket = supermercados.value[swapIndex];
    [currentMarket.order, targetMarket.order] = [targetMarket.order, currentMarket.order];
    [currentMarket, targetMarket].forEach(market=>{
      apiService.addToSyncQueue({
        type: SyncActionType.UPDATE_SUPERMARKET_ORDER,
        payload: {
          id: market.id,
          order: market.order
        },
        timestamp: Date.now()
      });

    })
    saveDataToLocalStorage();
  };

  /**
   * updateSupermercadosOrder
   * Actualiza el orden y visibilidad de los supermercados según el array proporcionado
   * @param newSupermercados Array de supermercados con el nuevo orden y visibilidad
   */
  const updateSupermercadosOrder = (newSupermercados: Supermercado[]) => {
    // Actualizar el orden de cada supermercado según su posición en el array
    newSupermercados.forEach((item, index) => {
      if (item.id !== 0) { // No cambiar el orden del supermercado genérico (id=0)
        item.order = index;
        apiService.addToSyncQueue({
          type: SyncActionType.UPDATE_SUPERMARKET_ORDER,
          payload: {
            id:item.id,
            order:index
          },
          timestamp: Date.now()
        });
      }
    });
    // Actualizar el array de supermercados en el store
    supermercados.value = [...newSupermercados];
    // Guardar en localStorage
    saveDataToLocalStorage(true);
  };

  const fullScreen = useState<boolean>('fullscreen', () => false);
  const setFullscreen = (fullscreen: boolean) => {
    fullScreen.value = fullscreen;
    saveDataToLocalStorage();
  };

  const setFullScreen = setFullscreen; // Alias para mantener compatibilidad

  // Función centralizada para actualizar productos
  const updateProductos = (newProductos: Producto[]) => {
    // Actualizar el estado de los productos
    productos.value = newProductos;

    // Guardar en localStorage
    saveDataToLocalStorage();
  };

  const appName = useState<string>('appName', () => 'Hungry!');
  // Inicializar defaultTabActive con el valor del localStorage o 2 como respaldo
  const defaultTabActive = useState<number>('defaultTabActive', () => {
    const storedValue = localStorageService.getSubItem('defaultTabActive');
    return storedValue !== null ? storedValue : 2;
  });
  const setDefaultTabActive = (tabIndex: number) => {
    defaultTabActive.value = tabIndex;
    saveDataToLocalStorage();
  };

  const alturaDisponible = useState<number>('alturaDisponible', () => 0);
  const maxLenght = useState<number>('maxLenght', () => 29);
  const ignoreDrag = useState<boolean>('ignoreDrag', () => false);

  const resetToDefaults = () => {
    // Restablecer productos a un array vacío
    productos.value = [];

    // Restablecer supermercados a los valores por defecto
    supermercados.value = [
      { id: 0, text: 'Cualquier Supermercado', logo: 'hungry.svg',        visible: true, order: 0 },
      { id: 1, text: 'Carrefour',              logo: 'carrefour.svg',     visible: true, order: 1 },
      { id: 2, text: 'Mercadona',              logo: 'mercadona.svg',     visible: true, order: 2 },
      { id: 3, text: 'La Carmela',             logo: 'super_carmela.svg', visible: true, order: 3 },
    ];

    // Ordenar los supermercados por la propiedad 'order'
    sortSupermercadosByOrder();
    // establecemos lastSyncTimestamp a null para que se sincronice al siguiente cambio
    lastSyncTimestamp.value = null;
    // Restablecer categorías a los valores por defecto
    categorias.value = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      text: `Categoría ${String(i).padStart(2, '0')}`,
      bgColor: bgColors[i],
      visible: true
    }));

    // Restablecer datos de inicio de sesión
    loginData.value = { email: '', token: '', fingerID: '', logged: false };

    // Restablecer otras configuraciones
    defaultTabActive.value = 0;
    fullScreen.value = false;

    // Guardar los cambios en localStorage usando los métodos correctos
    localStorageService.setSubItem('productos', productos.value);
    localStorageService.setSubItem('supermercados', supermercados.value);
    localStorageService.setSubItem('categorias', categorias.value);
    localStorageService.setSubItem('loginData', loginData.value);
    localStorageService.setSubItem('defaultTabActive', defaultTabActive.value);
    localStorageService.setSubItem('fullScreen', fullScreen.value);
    localStorageService.setSubItem('lastSyncTimestamp', lastSyncTimestamp.value);
  };

  loadDataFromLocalStorage();

  // Asegurarse de que los supermercados estén ordenados al iniciar la aplicación
  sortSupermercadosByOrder();

  // Procesar cola cuando cambia el estado de login
  watch(() => loginData.value.logged, async (newValue) => {
    if (newValue) {
      apiService.forceProcessQueue();
      await periodicSyncWithAPI(); // Initial sync
      if (syncIntervalId) clearInterval(syncIntervalId);
      syncIntervalId = setInterval(periodicSyncWithAPI, 30000); // Periodic sync every 30 seconds
    } else {
      if (syncIntervalId) clearInterval(syncIntervalId);
      syncIntervalId = null;
    }
  });

  const periodicSyncWithAPI = async () => {
    if (!loginData.value.logged || !navigator.onLine) {
      return;
    }
    console.log("Attempting periodic sync...");
    try {
      const syncPayload: SyncData = {
        productos: productos.value,
        categorias: categorias.value,
        supermercados: supermercados.value,
        lastChangeTimestamp: lastSyncTimestamp.value || new Date(epochTime).getTime(),
      };
      const response = await apiService.syncData(loginData.value.fingerID, syncPayload);
      
      if (response.result && response.data) {
        console.log("Periodic sync successful, merging data:", response.data);
        await mergeSyncData(response.data); // Call mergeSyncData
        lastSyncTimestamp.value = Date.now();
        saveDataToLocalStorage(); // Save after successful merge
      } else {
        console.log("Periodic sync completed, but no data to merge or result was false:", response);
        // Update lastSyncTimestamp even if there's no data to merge but the call was successful
        if (response.result) {
            lastSyncTimestamp.value = Date.now();
            saveDataToLocalStorage();
        }
      }
    } catch (error) {
      console.error("Error during periodic sync:", error);
    }
  };

  const isServerNewer = (serverTimestamp?: string, localTimestamp?: string): boolean => {
    const serverTime = serverTimestamp ? new Date(serverTimestamp).getTime() : new Date(epochTime).getTime();
    const localTime = localTimestamp ? new Date(localTimestamp).getTime() : new Date(epochTime).getTime();
    return serverTime > localTime;
  };

  const mergeSyncData = async (syncResponse: SyncDataResponse) => {
    const pendingItems = apiService.getQueueStatus().queue;

    // Merge Productos
    if (syncResponse.productos) {
      const apiProductIds = new Set(syncResponse.productos.map(p => p.id));
      const localProductosToKeep: Producto[] = [];

      // Process server items
      for (const apiItem of syncResponse.productos) {
        const localItem = productos.value.find(p => p.id === apiItem.id);
        if (localItem) {
          if (isServerNewer(apiItem.timestamp, localItem.timestamp)) {
            Object.assign(localItem, apiItem);
          }
          localProductosToKeep.push(localItem);
        } else {
          apiItem.timestamp = apiItem.timestamp || epochTime; // Ensure new items have a timestamp
          localProductosToKeep.push(apiItem);
        }
      }
      
      // Add new local items pending sync (not yet on server)
      productos.value.forEach(localItem => {
        if (!apiProductIds.has(localItem.id)) {
          const isPendingNew = pendingItems.some(
            (action: SyncAction) => action.type === SyncActionType.NEW_PRODUCT && action.payload.id === localItem.id
          );
          if (isPendingNew) {
            localProductosToKeep.push(localItem);
          }
        }
      });
      productos.value = localProductosToKeep;
    }

    // Merge Categorias
    if (syncResponse.categorias) {
      const apiCategoriaIds = new Set(syncResponse.categorias.map(c => c.id));
      const localCategoriasToKeep: Categoria[] = [];

      for (const apiItem of syncResponse.categorias) {
        const localItem = categorias.value.find(c => c.id === apiItem.id);
        if (localItem) {
          if (isServerNewer(apiItem.timestamp, localItem.timestamp)) {
            Object.assign(localItem, apiItem);
          }
          localCategoriasToKeep.push(localItem);
        } else {
          apiItem.timestamp = apiItem.timestamp || epochTime;
          localCategoriasToKeep.push(apiItem);
        }
      }
      
      // Since categories are predefined and not user-creatable offline,
      // the server's list of categories is authoritative.
      // Any local category not in the server's response should be removed.
      // The `localCategoriasToKeep` already contains all categories from the server (either updated existing ones or new ones from server).
      categorias.value = localCategoriasToKeep.sort((a,b) => a.id - b.id);
    }

    // Merge Supermercados
    if (syncResponse.supermercados) {
      const apiSupermercadoIds = new Set(syncResponse.supermercados.map(s => s.id));
      const localSupermercadosToKeep: Supermercado[] = [];

      for (const apiItem of syncResponse.supermercados) {
        const localItem = supermercados.value.find(s => s.id === apiItem.id);
        if (localItem) {
          if (isServerNewer(apiItem.timestamp, localItem.timestamp)) {
            Object.assign(localItem, apiItem);
          }
          localSupermercadosToKeep.push(localItem);
        } else {
          apiItem.timestamp = apiItem.timestamp || epochTime;
          localSupermercadosToKeep.push(apiItem);
        }
      }
      
      supermercados.value.forEach(localItem => {
        if (!apiSupermercadoIds.has(localItem.id)) {
          const isPendingNew = pendingItems.some(
            (action: SyncAction) => action.type === SyncActionType.NEW_SUPERMARKET && action.payload.id === localItem.id // Assuming payload has id
          );
          // Also keep the default 'Any Supermarket' (id: 0)
          if (isPendingNew || localItem.id === 0) {
            localSupermercadosToKeep.push(localItem);
          }
        }
      });
      supermercados.value = localSupermercadosToKeep;
      sortSupermercadosByOrder(); // Ensure order is maintained
    }
    // Note: saveDataToLocalStorage() is called in periodicSyncWithAPI after this function completes.
  };

  return {
    appName,
    defaultTabActive,
    alturaDisponible,
    fullScreen,
    maxLenght,
    loginData,
    updateLoginData,
    supermercados,
    categorias,
    productos,
    tabs,
    bgColors,
    ignoreDrag,
    lastSyncTimestamp,
    updateLastSyncTimestamp,
    findProducto,
    findSupermercado,
    findCategoria,
    addProduct,
    updateProduct,
    updateCategoria,
    updateCategorias,
    updateSupermercados,
    updateSupermercadosOrder, // Nuevo método para actualizar el orden de los supermercados
    setVisibleCategoria,
    setAmount,
    toggleSelected,
    toggleDone,
    updateProductText,
    updateCategoryText,
    updateCategoryVisible,
    setEmail,
    setToken,
    setFingerID,
    setLogged,
    sortedA2Z,
    sortedByCategory,
    purchased,
    clearList,
    exportData,
    importData,
    addMarket,
    setMarketVisible,
    setMarketOrder,
    setFullscreen,
    setFullScreen,
    setDefaultTabActive,
    resetToDefaults,
    updateProductos
  };
};