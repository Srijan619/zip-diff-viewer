import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const options = {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
};

const app = createApp(App);
app.use(Toast, options);
app.mount('#app');
