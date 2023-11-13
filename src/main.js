import { createApp } from 'vue'
import './stylesheets/theme-style.css'
import App from './App.vue'
import router from './router'

createApp(App)
.use(router)
.mount('#app')
