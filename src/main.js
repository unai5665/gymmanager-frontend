import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './app.vue'
import router from './router'
import i18n from './i18n'
import './style.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

// Apply persisted accessibility settings before first render
import('./stores/ui').then(({ useUiStore }) => {
  useUiStore().applyOnStartup()
})

app.mount('#app')
