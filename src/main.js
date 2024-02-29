import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import Vue3TouchEvents from "vue3-touch-events";
import 'bootstrap/dist/css/bootstrap.min.css';

const app=createApp(App);
app.use(store);
app.use(Vue3TouchEvents);
app.mount('#app')
