import { createStore } from 'vuex';

const initialState= {
  appStatic:{
    appName:'Hungry!',
    maxLenght: 40,
    ignoreDrag:false,
    heightDesviation: -90,
    tabs: [
      { id: 0, text: 'Configuración',          logo: 'config.svg',        selectable: false,  },
      { id: 1, text: 'Añadir Productos',       logo: 'add.svg',           selectable: true,   },
      { id: 2, text: 'Por orden alfabético',   logo: 'a2z.svg',           selectable: true,   },
      { id: 3, text: 'Por categoría',          logo: 'categorias.svg',    selectable: true,   },
      { id: 4, text: 'Lista de la compra',     logo: 'cart.svg',          selectable: true,   },
    ],
    datos: ['productos','categorias','supermercados'],
    URLBase: 'https://www.infoinnova.es/lolo/api',
  },
  configuracion:{
    defaultTabActive: 1,
    alturaDisponible: 0,
    fullScreen: false,
    canClickProducts: true,
    lastChangeTimestamp: 0,
    lastLoginTimestamp: 0,
    loginData:{
      email:"",
      token:"",
    },
    supermercados:[
      { id: 0, text: 'Cualquier Supermercado', logo: 'hungry.svg',        visible:    true, order:0 },
      { id: 1, text: 'Carrefour',              logo: 'carrefour.svg',     visible:    true, order:1 },
      { id: 2, text: 'Mercadona',              logo: 'mercadona.svg',     visible:    true, order:2 },
      { id: 3, text: 'La Carmela',             logo: 'super_carmela.svg', visible:    true, order:3 },
    ],
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
}
export default createStore({
  state: JSON.parse(JSON.stringify(initialState)),
  mutations: {
    resetStore            ( state,                     ) { 
      let alturaDisponible=state.configuracion.alturaDisponible;
      Object.assign(state,initialState)
      state.configuracion.alturaDisponible=alturaDisponible;
    }, 
    setAlturaDisponible   ( state,      alturaDisponible  ) { state.configuracion.alturaDisponible   = alturaDisponible },
    setConfiguracion      ( state,      configuracion     ) { state.configuracion                    = configuracion    },
    setDefaultTabActive   ( state,      defaultTabActive  ) { state.configuracion.defaultTabActive   = defaultTabActive },
    setFullScreen         ( state,      fullScreen        ) { state.configuracion.fullScreen         = fullScreen       },
    setIgnoreDrag         ( state,      ignoreDrag        ) { state.appStatic.ignoreDrag             = ignoreDrag       },
    
    setProducts           ( state,      productos         ) { state.configuracion.productos          = productos        },
    setCategorias         ( state,      categorias        ) { state.configuracion.categorias         = categorias       },
    setSupermercados      ( state,      supermercados     ) { state.configuracion.supermercados      = supermercados    },

    setLoginData          ( state,      loginData         ) { state.configuracion.loginData          = loginData        },
    setEmail              ( state,      email             ) { state.configuracion.loginData.email    = email            },
    setToken              ( state,      token             ) { state.configuracion.loginData.token    = token            },
    
    setCanClickProducts   ( state,      canClickProducts  ) { state.configuracion.canClickProducts   = canClickProducts },

    setState              ( state,      newState          ) { Object.assign(state, newState)                            }
  },
  actions: {
    setAlturaDisponible   ({ commit },  alturaDisponible  ) { commit('setAlturaDisponible', alturaDisponible)           },
    setConfiguracion      ({ commit },  configuracion     ) { commit('setConfiguracion',    configuracion   )           },
    setDefaultTabActive   ({ commit },  defaultTabActive  ) { commit('setDefaultTabActive', defaultTabActive)           },
    setFullScreen         ({ commit },  fullScreen        ) { commit('setFullScreen',       fullScreen      )           },
    setIgnoreDrag         ({ commit },  ignoreDrag        ) { commit('setIgnoreDrag',       ignoreDrag      )           },

    setCategorias         ({ commit },  categorias        ) { commit('setCategorias',       categorias      )           },
    setProductos          ({ commit },  productos         ) { commit('setProducts',         productos       )           },
    setSupermercados      ({ commit },  supermercados     ) { commit('setSupermercados',    supermercados   )           },

    setLoginData          ({ commit },  loginData         ) { commit('setLoginData',        loginData       )           },
    setEmail              ({ commit },  email             ) { commit('setEmail',            email           )           },
    setToken              ({ commit },  token             ) { commit('setToken',            token           )           },

    setCanClickProducts   ({ commit },  canClickProducts  ) { commit('setCanClickProducts', canClickProducts)           },
    setState              ({ commit },  newState          ) { commit('setState',            newState        )           },
  },
  getters: {
    getCategoriaFromID:   ( state )=>(id)=>state.configuracion.categorias.find(c => c.id === id),
    getSupermercadoFromID:( state )=>(id)=>state.configuracion.supermercados.find(s => s.id === id),
    
    getAlturaDisponible:  ( state )=>(  )=>state.configuracion.alturaDisponible,
    getConfiguracion:     ( state )=>(  )=>state.configuracion,
    getDefaultTabActive:  ( state )=>(  )=>state.configuracion.defaultTabActive,
    getFullScreen:        ( state )=>(  )=>state.configuracion.fullScreen,
    getIgnoreDrag:        ( state )=>(  )=>state.appStatic.ignoreDrag,

    getCategorias:        ( state )=>(  )=>state.configuracion.categorias,
    getProductos:         ( state )=>(  )=>state.configuracion.productos,
    getSupermercados:     ( state )=>(  )=>state.configuracion.supermercados,
 
    getLoginData:         ( state )=>(  )=>state.configuracion.loginData,
    getEmail:             ( state )=>(  )=>state.configuracion.loginData.email,
    getToken:             ( state )=>(  )=>state.configuracion.loginData.token,

    getHeightDesviation:  ( state )=>(  )=>state.appStatic.heightDesviation,
    getMaxLenght:         ( state )=>(  )=>state.appStatic.maxLenght,
    getTabs:              ( state )=>(  )=>state.appStatic.tabs,

    getCanClickProducts:  ( state )=>(  )=>state.configuracion.canClickProducts,

    getAppName:           ( state )=>(  )=>state.appStatic.appName,

    getInitialState:      (       )=>(id)=>initialState.configuracion[id],

    getState:             ( state )=>(id)=>state.configuracion[id],
    getDatos:             ( state )=>(  )=>state.appStatic.datos,
    getURLBase:           ( state )=>(  )=>state.appStatic.URLBase,
  },
})
