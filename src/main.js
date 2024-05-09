import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import Vue3TouchEvents from "vue3-touch-events"
import { DID, DOM, _DOM } from './utilidades'
import './assets/css/bootstrap.min.css'
import './assets/css/Style.scss'
import './registerServiceWorker'


const app=createApp(App);
app.use(store);
app.use(Vue3TouchEvents);
app.config.productionTip = false;
app.mount('#app')

window.DID  = DID
window.DOM  = DOM
window._DOM = _DOM