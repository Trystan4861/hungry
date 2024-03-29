import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import Vue3TouchEvents from "vue3-touch-events";
import { Notifications } from '@kyvg/vue3-notification';
import 'bootstrap/dist/css/bootstrap.min.css';
import './registerServiceWorker'

const app=createApp(App);
app.use(store);
app.use(Notifications);
app.use(Vue3TouchEvents);
app.mount('#app')
