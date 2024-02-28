import { createStore } from 'vuex';

export default createStore({
  state: {
    appStatic:{
      varIDCategoria:-1,
      saveProductsState:true,
      localStorageKeys:['categoriesData','productsData'],
      tabs: [
        { logo:'config.svg'},
        { logo:'add.svg'},
        { logo:'a2z.svg'},
        { logo:'categorias.svg'},
        { logo:'cart.svg'},
      ],
      configNames:[
        'Categorías',
        'Productos'
      ],
      supermercados:[
        { id:0, text:'Cualquier Supermercado', logo:'hungry.svg'        },
        { id:1, text:'Carrefour',              logo:'carrefour.svg'     },
        { id:2, text:'Mercadona',              logo:'mercadona.svg'     },
        { id:3, text:'La Carmela',             logo:'super_carmela.svg' },
      ]
    },
    configuracion:{
      appName:'Hungry!',
      maxLenght: 40,
      defaultTabActive:1,
      categorias: [
        { id: 0, text:'Categoría  1', bgColor:'#d83c3d', visible:true },
        { id: 1, text:'Categoría  2', bgColor:'#d8993c', visible:true },
        { id: 2, text:'Categoría  3', bgColor:'#b9d83c', visible:true },
        { id: 3, text:'Categoría  4', bgColor:'#5bd83c', visible:true },
        { id: 4, text:'Categoría  5', bgColor:'#3dd87a', visible:true },
        { id: 5, text:'Categoría  6', bgColor:'#47ffff', visible:true },
        { id: 6, text:'Categoría  7', bgColor:'#3b7ad7', visible:true },
        { id: 7, text:'Categoría  8', bgColor:'#5b3cd8', visible:true },
        { id: 8, text:'Categoría  9', bgColor:'#b83cd8', visible:true },
        { id: 9, text:'Categoría 10', bgColor:'#d83ba4', visible:true },
        { id:10, text:'Categoría 11', bgColor:'#6f1918', visible:true },
        { id:11, text:'Categoría 12', bgColor:'#704c1a', visible:true },
        { id:12, text:'Categoría 13', bgColor:'#5d6f19', visible:true },
        { id:13, text:'Categoría 14', bgColor:'#2b6f18', visible:true },
        { id:14, text:'Categoría 15', bgColor:'#1f8448', visible:true },
        { id:15, text:'Categoría 16', bgColor:'#196f70', visible:true },
        { id:16, text:'Categoría 17', bgColor:'#183c6e', visible:true },
        { id:17, text:'Categoría 18', bgColor:'#2c186f', visible:true },
        { id:18, text:'Categoría 19', bgColor:'#5e186e', visible:true },
        { id:19, text:'Categoría 20', bgColor:'#6e1952', visible:true },
      ],
      productos:[]
    },
  },
  mutations: {
    updateCategoria(state, payload){
      const {id, text, bgColor, visible} = payload;
      const index = state.configuracion.categorias.findIndex(categoria => categoria.id === id);
      if(!index<0){
        state.configuracion.categorias[index].text = text;
        state.configuracion.categorias[index].bgColor = bgColor;
        state.configuracion.categorias[index].visible = Boolean(visible);
      }
    },
    setCategories         ( state,      categorias      ) { state.configuracion.categorias        = categorias        },
    setProducts           ( state,      productos       ) { state.configuracion.productos         = productos         },
    setDefaultTabActive   ( state,      defaultTabActive) { state.configuracion.defaultTabActive  = defaultTabActive  },
    setConfiguracion      ( state,      configuracion   ) { state.configuracion                   = configuracion     },
    setMaxLenght          ( state,      maxLenght       ) { state.configuracion.maxLenght         = maxLenght         },
  },
  actions: {
    setConfiguracion      ({ commit }, configuracion    ) { commit('setConfiguracion',     configuracion    )         },
    setProductos          ({ commit }, productos        ) { commit('setProducts',          productos        )         },
    setCategorias         ({ commit }, categorias       ) { commit('setCategories',        categorias       )         },
    setDefaultTabActive   ({ commit }, defaultTabActive ) { commit('setDefaultTabActive',  defaultTabActive )         },
  },
  getters: {
    getConfiguracion:     (state)=>(  )=>state.configuracion,
    getCategorias:        (state)=>(  )=>state.configuracion.categorias,
    getCategoriaFromID:   (state)=>(id)=>state.configuracion.categorias.find(categoria => categoria.id === id),
    getDefaultTabActive:  (state)=>(  )=>state.configuracion.defaultTabActive,
    getProductos:         (state)=>(  )=>state.configuracion.productos,
    getMaxLenght:         (state)=>(  )=>state.configuracion.maxLenght,
    
    getTabs:              (state)=>(  )=>state.appStatic.tabs,
    getConfigNames:       (state)=>(  )=>state.appStatic.configNames,
    getVarIDCategoria:    (state)=>(  )=>state.appStatic.varIDCategoria,
    getLocalStorageKeys:  (state)=>(  )=>state.appStatic.localStorageKeys,
    getSupermercados:     (state)=>(  )=>state.appStatic.supermercados,
    getSaveProductsState: (state)=>(  )=>state.appStatic.saveProductsState,
  }
                    });
