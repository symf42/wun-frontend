import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router';
import './style.css'
import 'flowbite';
import App from './App.vue'
import Login from './components/Login.vue'
import Tasks from './components/Tasks.vue'
import CreateTask from './components/CreateTask.vue'



const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const routes = [
    { path: '/', component: Login },
    { path: '/tasks', component: Tasks },
    { path: '/task/create', component: CreateTask },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
app.use(router)

app.mount('#app')
