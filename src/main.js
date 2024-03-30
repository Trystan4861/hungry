import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import Vue3TouchEvents from "vue3-touch-events";
import 'bootstrap/dist/css/bootstrap.min.css';
import './registerServiceWorker'
import Notifications from '@kyvg/vue3-notification'

const app=createApp(App);
app.use(store);
app.use(Vue3TouchEvents);
app.use(Notifications)
app.mount('#app')
