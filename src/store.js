import { createStore } from 'vuex';

export default createStore({
  state: {
    appStatic:{
      maxLenght: 40,
      ignoreDrag:false,
      heightDesviation: -90,
      localStorageKeys:['categoriesData','productsData'],
      tabs: [
        { id: 0, text:'Configuración',          logo: 'config.svg',     selectable:false, class:''},
        { id: 1, text:'Añadir Productos',       logo: 'add.svg',        selectable:true,  class:''},
        { id: 2, text:'Por orden alfabético',   logo: 'a2z.svg',        selectable:true,  class:''},
        { id: 3, text:'Por categoría',          logo: 'categorias.svg', selectable:true,  class:''},
        { id: 4, text:'Lista de la compra',     logo: 'cart.svg',       selectable:true,  class:''},
      ],
      configNames:[
        'Categorías',
        'Productos'
      ],
      supermercados:[
        { id: 0, text:'Cualquier Supermercado', logo:'hungry.svg',        class:''},
        { id: 1, text:'Carrefour',              logo:'carrefour.svg',     class:''},
        { id: 2, text:'Mercadona',              logo:'mercadona.svg',     class:''},
        { id: 3, text:'La Carmela',             logo:'super_carmela.svg', class:''},
      ]
    },
    configuracion:{
      appName:'Hungry!',
      defaultTabActive:1,
      alturaDisponible:0,
      fullScreen: false,
      canClickProducts:true,
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
      const index = state.configuracion.categorias.findIndex(categoria => categoria.id === id);
      if(!index<0){
        state.configuracion.categorias[index].text = text;
        state.configuracion.categorias[index].bgColor = bgColor;
        state.configuracion.categorias[index].visible = Boolean(visible);
      }
    },
    setAlturaDisponible   ( state,     alturaDisponible) { state.configuracion.alturaDisponible   = alturaDisponible  },
    setCategorias         ( state,     categorias      ) { state.configuracion.categorias         = categorias        },
    setConfiguration      ( state,     configuration   ) { state.configuracion                    = configuration     },
    setDefaultTabActive   ( state,     defaultTabActive) { state.configuracion.defaultTabActive   = defaultTabActive  },
    setFullScreen         ( state,     fullScreen      ) { state.configuracion.fullScreen         = fullScreen        },
    setIgnoreDrag         ( state,     ignoreDrag      ) { state.appStatic.ignoreDrag             = ignoreDrag        },
    setProducts           ( state,     productos       ) { state.configuracion.productos          = productos         },
    setEmail              ( state,     email           ) { state.configuracion.loginData.email    = email             },
    setLogged             ( state,     logged          ) { state.configuracion.loginData.logged   = logged            },
    setToken              ( state,     token           ) { state.configuracion.loginData.token    = token             },
    setCanClickProducts   (state,      canClickProducts) { state.configuracion.canClickProducts   = canClickProducts  },
  },
  actions: {
    setAlturaDisponible   ({ commit }, alturaDisponible) { commit('setAlturaDisponible', alturaDisponible)            },
    setCategorias         ({ commit }, categorias      ) { commit('setCategorias',       categorias      )            },
    setConfiguration      ({ commit }, configuration   ) { commit('setConfiguration',    configuration   )            },
    setDefaultTabActive   ({ commit }, defaultTabActive) { commit('setDefaultTabActive', defaultTabActive)            },
    setFullScreen         ({ commit }, fullScreen      ) { commit('setFullScreen',       fullScreen      )            },
    setIgnoreDrag         ({ commit }, ignoreDrag      ) { commit('setIgnoreDrag',       ignoreDrag      )            },
    setProductos          ({ commit }, productos       ) { commit('setProducts',         productos       )            },
    setEmail              ({ commit }, email           ) { commit('setEmail',            email           )            },
    setLogged             ({ commit }, logged          ) { commit('setLogged',           logged          )            },
    setToken              ({ commit }, token           ) { commit('setToken',            token           )            },
    setCanClickProducts   ({ commit }, canClickProducts) { commit('setCanClickProducts', canClickProducts)            },

  },
  getters: {
    getAlturaDisponible:  (state)=>(  )=>state.configuracion.alturaDisponible,
    getCategoriaFromID:   (state)=>(id)=>state.configuracion.categorias.find(categoria => categoria.id === id),
    getCategorias:        (state)=>(  )=>state.configuracion.categorias,
    getConfiguration:     (state)=>(  )=>state.configuracion,
    getDefaultTabActive:  (state)=>(  )=>state.configuracion.defaultTabActive,
    getFullScreen:        (state)=>(  )=>state.configuracion.fullScreen,
    getProductos:         (state)=>(  )=>state.configuracion.productos,

    getEmail:             (state)=>(  )=>state.configuracion.loginData.email,
    getLogged:            (state)=>(  )=>state.configuracion.loginData.logged,
    getToken:             (state)=>(  )=>state.configuracion.loginData.token,

    getConfigNames:       (state)=>(  )=>state.appStatic.configNames,
    getHeightDesviation:  (state)=>(  )=>state.appStatic.heightDesviation,
    getIgnoreDrag:        (state)=>(  )=>state.appStatic.ignoreDrag,
    getLocalStorageKeys:  (state)=>(  )=>state.appStatic.localStorageKeys,
    getMaxLenght:         (state)=>(  )=>state.appStatic.maxLenght,
    getSupermercadoFromID:(state)=>(id)=>state.appStatic.supermercados.find(supermercado=>supermercado.id===id),
    getSupermercados:     (state)=>(  )=>state.appStatic.supermercados,
    getTabs:              (state)=>(  )=>state.appStatic.tabs,

    getCanClickProducts:  (state)=>(  )=>state.configuracion.canClickProducts,
  }
});
