import type { Producto, Categoria, LoginData, Supermercado, ImportData, Tab } from '~/types';
import { localStorageService } from '~/localStorageService'; // Import the localStorageService

export const myStore = () => {
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

  const productos = useState<Producto[]>('productos', () => []);
  const supermercados = useState<Supermercado[]>('supermercados', () => [
    { id: 0, text: 'Cualquier Supermercado', logo: 'hungry.svg',        visible: true, order: 0 },
    { id: 1, text: 'Carrefour',              logo: 'carrefour.svg',     visible: true, order: 1 },
    { id: 2, text: 'Mercadona',              logo: 'mercadona.svg',     visible: true, order: 2 },
    { id: 3, text: 'La Carmela',             logo: 'super_carmela.svg', visible: true, order: 3 },
   ]);
  const loginData = useState<LoginData>('loginData', () => ({ email: '', token: '', fingerID: '', logged: false }));
  const categorias = useState<Categoria[]>('categorias', () => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    text: `Categoría ${String(i).padStart(2, '0')}`,
    bgColor: bgColors[i],
    visible: true
  })));

  const findProducto = (id: number) => productos.value.find(p => p.id === id);
  const findSupermercado = (id: number) => supermercados.value.find(m => m.id === id);
  const findCategoria = (id: number) => categorias.value.find(c => c.id === id);

  const exportData = () => {
    // Recopilamos todos los datos en un único objeto
    const data = {
      appName: appName.value,
      maxLenght: maxLenght.value,
      defaultTabActive: defaultTabActive.value,
      alturaDisponible: alturaDisponible.value,
      fullScreen: fullScreen.value,
      loginData: loginData.value,
      categorias: categorias.value,
      supermercados: supermercados.value,
      productos: productos.value,
    };

    return data;
  };

  const importData = (data: ImportData) => {
    try {
      // Importamos los datos a las variables reactivas
      if (data.loginData) loginData.value = data.loginData;
      if (data.categorias) categorias.value = data.categorias;
      if (data.supermercados) supermercados.value = data.supermercados;
      if (data.productos) productos.value = data.productos;

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
          supermercados.value = storedSupermercados;
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

  const saveDataToLocalStorage = () => {
    localStorageService.setSubItem('productos', productos.value);
    localStorageService.setSubItem('supermercados', supermercados.value);
    localStorageService.setSubItem('categorias', categorias.value);
    localStorageService.setSubItem('loginData', loginData.value);
    localStorageService.setSubItem('defaultTabActive', defaultTabActive.value);
    localStorageService.setSubItem('fullScreen', fullScreen.value);
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
    saveDataToLocalStorage();
  };

  const updateProduct = (id: number, newData: Partial<Producto>) => {
    const producto = findProducto(id);
    if (producto) {
      Object.assign(producto, newData);
      saveDataToLocalStorage();
    }
  };

  const updateCategoria = (id: number, newText: string) => {
    const categoria = findCategoria(id);
    if (categoria) {
      categoria.text = newText;
      saveDataToLocalStorage();
    }
  };

  const updateCategorias = (visibleCategoriaIds: number[]) => {
    categorias.value.forEach(categoria => {
      categoria.visible = visibleCategoriaIds.includes(categoria.id);
    });
    saveDataToLocalStorage();
  };

  const setVisibleCategoria = (id: number, visible: boolean) => {
    const categoria = findCategoria(id);
    if (categoria) {
      categoria.visible = visible;
      saveDataToLocalStorage();
    }
  };

  const setAmount = (id: number, amount: number) => {
    const producto = findProducto(id);
    if (producto) {
      producto.amount = amount;
      saveDataToLocalStorage();
    }
  };

  const toggleSelected = (id: number) =>{
      const producto = findProducto(id);
      if (producto) {
        producto.selected = !producto.selected;
        saveDataToLocalStorage();
      }
  };

  const toggleDone = (id: number) =>{
      const producto = findProducto(id);
      if (producto) {
        producto.done = !producto.done;
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

  const sortedA2Z = computed(() => [...productos.value].sort((a, b) => a.text.localeCompare(b.text)));
  const sortedByCategory = computed(() => [...productos.value].sort((a, b) => a.id_categoria - b.id_categoria || a.text.localeCompare(b.text)));
  const purchased = computed(() => productos.value.filter(p => p.done));

  const clearList = (onlyDone: boolean) => {
    productos.value.forEach(p => {
      if ((onlyDone && p.done) || (!onlyDone && p.selected)) {
        p.selected = false;
        p.done = false;
      }
    });
    saveDataToLocalStorage();
  };

  const addMarket = (market: Supermercado) => {
    const maxOrder = supermercados.value.length;
    supermercados.value.push({ ...market, order: maxOrder });
    saveDataToLocalStorage();
  };

  const setMarketVisible = (id: number, visible: boolean) => {
    const market = findSupermercado(id);
    if (market) {
      market.visible = visible;
      saveDataToLocalStorage();
    }
  };

  const updateSupermercados = (visibleSupermercadoIds: number[]) => {
    supermercados.value.forEach(supermercado => {
      supermercado.visible = visibleSupermercadoIds.includes(supermercado.id);
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
    supermercados.value.sort((a, b) => a.order - b.order);
    saveDataToLocalStorage();
  };

  const fullScreen = useState<boolean>('fullscreen', () => false);
  const setFullscreen = (fullscreen: boolean) => {
    fullScreen.value = fullscreen;
    saveDataToLocalStorage();
  };

  const setFullScreen = setFullscreen; // Alias para mantener compatibilidad

  const appName = useState<string>('appName', () => 'Hungry!');
  const defaultTabActive = useState<number>('defaultTabActive', () => 2);
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
  };

  loadDataFromLocalStorage();

  return {
    appName,
    defaultTabActive,
    alturaDisponible,
    fullScreen,
    maxLenght,
    loginData,
    supermercados,
    categorias,
    productos,
    tabs,
    bgColors,
    ignoreDrag,
    findProducto,
    findSupermercado,
    findCategoria,
    addProduct,
    updateProduct,
    updateCategoria,
    updateCategorias,
    updateSupermercados,
    setVisibleCategoria,
    setAmount,
    toggleSelected,
    toggleDone,
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
    resetToDefaults
  };
};