import { createApp } from 'vue'
import { createHead } from '@vueuse/head'

import App from '@/App.vue'

// NATCA Design System — tokens first, then shell styles
import '@natca-itc/ui-shell/tokens'
import '@natca-itc/ui-shell/shell-styles'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// App styles
import '@styles/styles.scss'

// Plugins
import { router } from '@/plugins/1.router'
import { store } from '@/plugins/2.pinia'
import vuetify from '@/plugins/vuetify'
import '@/plugins/webfontloader'

// Create vue app
const app = createApp(App)

// Register plugins
app.use(createHead())
app.use(store)
app.use(router)
app.use(vuetify)

// Mount vue app
app.mount('#app')
