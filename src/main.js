import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Antd from 'ant-design-vue';
import router from './router';

createApp(App).use(router).use(Antd).mount('#app')
