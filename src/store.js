import { createStore } from 'vuex';

export default createStore({
  state: {
    defaultTabActive:1,
    alturaDisponible:0,
    varIDCategoria:-1,
    categorias: [
        {id:0,text:'Categoría 1', bgColor:'#d83c3d'},
        {id:1,text:'Categoría 2', bgColor:'#d8993c'},
        {id:2,text:'Categoría 3', bgColor:'#b9d83c'},
        {id:3,text:'Categoría 4', bgColor:'#5bd83c'},
        {id:4,text:'Categoría 5', bgColor:'#3dd87a'},
        {id:5,text:'Categoría 6', bgColor:'#47ffff'},
        {id:6,text:'Categoría 7', bgColor:'#3b7ad7'},
        {id:7,text:'Categoría 8', bgColor:'#5b3cd8'},
        {id:8,text:'Categoría 9', bgColor:'#b83cd8'},
        {id:9,text:'Categoría 10', bgColor:'#d83ba4'},
        {id:10,text:'Categoría 11', bgColor:'#6f1918'},
        {id:11,text:'Categoría 12', bgColor:'#704c1a'},
        {id:12,text:'Categoría 13', bgColor:'#5d6f19'},
        {id:13,text:'Categoría 14', bgColor:'#2b6f18'},
        {id:14,text:'Categoría 15', bgColor:'#1f8448'},
        {id:15,text:'Categoría 16', bgColor:'#196f70'},
        {id:16,text:'Categoría 17', bgColor:'#183c6e'},
        {id:17,text:'Categoría 18', bgColor:'#2c186f'},
        {id:18,text:'Categoría 19', bgColor:'#5e186e'},
        {id:19,text:'Categoría 20', bgColor:'#6e1952'},
      ],
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
      ]
  },
  mutations: {
    setCategorias(state, categorias){state.categorias = categorias},
    updateCategoria(state, payload){
      const {id, text, bgColor} = payload;
      const categoria = state.categorias.find(categoria => categoria.id === id);
      if(categoria){
        categoria.text = text;
        categoria.bgColor = bgColor;
      }
    },
    setDefaultTabActive(state,defaultTabActive){state.defaultTabActive = defaultTabActive},
    setAlturaDisponible(state, alturaDisponible){state.alturaDisponible = alturaDisponible},
    setVarIDCategoria(state, varIDCategoria){state.varIDCategoria = varIDCategoria},
  },
  actions: {
  },
  getters: {
    getCategoriaFromID: (state)=>(id)=>state.categorias.find(categoria => categoria.id === id),
    getDefaultTabActive:(state)=>(  )=>state.defaultTabActive,
    getCategorias:      (state)=>(  )=>state.categorias,
    getAlturaDisponible:(state)=>(  )=>state.alturaDisponible,
    getTabs:            (state)=>(  )=>state.tabs,
    getConfigNames:     (state)=>(  )=>state.configNames,
    getVarIDCategoria:  (state)=>(  )=>state.varIDCategoria,
  }
});
