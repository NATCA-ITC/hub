import { createApp } from 'vue'
import { createHead } from '@vueuse/head'

import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// Create head manager
const head = createHead()

// Use head plugin
app.use(head)

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
