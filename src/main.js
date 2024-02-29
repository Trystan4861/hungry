import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

import 'bootstrap/dist/css/bootstrap.min.css';
import '@sweetalert2/theme-bootstrap-4/bootstrap-4.scss'; 

const app=createApp(App);
app.use(store);
app.mount('#app')
