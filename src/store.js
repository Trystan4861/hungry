import { createStore } from 'vuex';

export default createStore({
  state: {
    appStatic:{
      maxLenght: 40,
      varIDCategoria:-1,
      saveProductsState:true,
      ignoreDrag:false,
      heightDesviation: -90,
      localStorageKeys:['categoriesData','productsData'],
      tabs: [
        { id: 0, text:'Configuración',          logo: 'config.svg',     selectable:false },
        { id: 1, text:'Añadir Productos',       logo: 'add.svg',        selectable:true  },
        { id: 2, text:'Por orden alfabético',   logo: 'a2z.svg',        selectable:true  },
        { id: 3, text:'Por categoría',          logo: 'categorias.svg', selectable:true  },
        { id: 4, text:'Lista de la compra',     logo: 'cart.svg',       selectable:true  },
      ],
      configNames:[
        'Categorías',
        'Productos'
      ],
      supermercados:[
        { id: 0, text:'Cualquier Supermercado', logo:'hungry.svg'        },
        { id: 1, text:'Carrefour',              logo:'carrefour.svg'     },
        { id: 2, text:'Mercadona',              logo:'mercadona.svg'     },
        { id: 3, text:'La Carmela',             logo:'super_carmela.svg' },
      ]
    },
    configuration:{
      appName:'Hungry!',
      defaultTabActive:1,
      alturaDisponible:0,
      fullScreen: false,
      loginData:{
        email:"",
        token:"",
        logged:false,
      },
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
      const index = state.configuration.categorias.findIndex(categoria => categoria.id === id);
      if(!index<0){
        state.configuration.categorias[index].text = text;
        state.configuration.categorias[index].bgColor = bgColor;
        state.configuration.categorias[index].visible = Boolean(visible);
      }
    },
    setAlturaDisponible    ( state,     alturaDisponible) { state.configuration.alturaDisponible   = alturaDisponible  },
    setCategorias          ( state,     categorias      ) { state.configuration.categorias         = categorias        },
    setConfiguration       ( state,     configuration   ) { state.configuration                    = configuration     },
    setDefaultTabActive    ( state,     defaultTabActive) { state.configuration.defaultTabActive   = defaultTabActive  },
    setFullScreen          ( state,     fullScreen      ) { state.configuration.fullScreen         = fullScreen        },
    setIgnoreDrag          ( state,     ignoreDrag      ) { state.appStatic.ignoreDrag             = ignoreDrag        },
    setProducts            ( state,     productos       ) { state.configuration.productos          = productos         },
    setEmail               ( state,     email           ) { state.configuration.loginData.email    = email             },
    setLogged              ( state,     logged          ) { state.configuration.loginData.logged   = logged            },
    setToken               ( state,     token           ) { state.configuration.loginData.token    = token             },
  },
  actions: {
    setAlturaDisponible    ({ commit }, alturaDisponible) { commit('setAlturaDisponible', alturaDisponible)            },
    setCategorias          ({ commit }, categorias      ) { commit('setCategorias',       categorias      )            },
    setConfiguration       ({ commit }, configuration   ) { commit('setConfiguration',    configuration   )            },
    setDefaultTabActive    ({ commit }, defaultTabActive) { commit('setDefaultTabActive', defaultTabActive)            },
    setFullScreen          ({ commit }, fullScreen      ) { commit('setFullScreen',       fullScreen      )            },
    setIgnoreDrag          ({ commit }, ignoreDrag      ) { commit('setIgnoreDrag',       ignoreDrag      )            },
    setProductos           ({ commit }, productos       ) { commit('setProducts',         productos       )            },
    setEmail               ({ commit }, email           ) { commit('setEmail',            email           )            },
    setLogged              ({ commit }, logged          ) { commit('setLogged',           logged          )            },
    setToken               ({ commit }, token           ) { commit('setToken',            token           )            },

  },
  getters: {
    getAlturaDisponible:   (state)=>(  )=>state.configuration.alturaDisponible,
    getCategoriaFromID:    (state)=>(id)=>state.configuration.categorias.find(categoria => categoria.id === id),
    getCategorias:         (state)=>(  )=>state.configuration.categorias,
    getConfiguration:      (state)=>(  )=>state.configuration,
    getDefaultTabActive:   (state)=>(  )=>state.configuration.defaultTabActive,
    getFullScreen:         (state)=>(  )=>state.configuration.fullScreen,
    getProductos:          (state)=>(  )=>state.configuration.productos,

    getEmail:              (state)=>(  )=>state.configuration.loginData.email,
    getLogged:             (state)=>(  )=>state.configuration.loginData.logged,
    getToken:              (state)=>(  )=>state.configuration.loginData.token,

    getConfigNames:        (state)=>(  )=>state.appStatic.configNames,
    getHeightDesviation:   (state)=>(  )=>state.appStatic.heightDesviation,
    getIgnoreDrag:         (state)=>(  )=>state.appStatic.ignoreDrag,
    getLocalStorageKeys:   (state)=>(  )=>state.appStatic.localStorageKeys,
    getMaxLenght:          (state)=>(  )=>state.appStatic.maxLenght,
    getSaveProductsState:  (state)=>(  )=>state.appStatic.saveProductsState,
    getSupermercadoFromID: (state)=>(id)=>state.appStatic.supermercados.find(supermercado=>supermercado.id===id),
    getSupermercados:      (state)=>(  )=>state.appStatic.supermercados,
    getTabs:               (state)=>(  )=>state.appStatic.tabs,
    getVarIDCategoria:     (state)=>(  )=>state.appStatic.varIDCategoria,
  }
});
