import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'

import App from '@/App.vue'

// Vuetify — reset + utilities first
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// NATCA Design System — tokens override Vuetify defaults, shell styles last
import '@natca-itc/ui-shell/tokens'
import '@natca-itc/ui-shell/shell-styles'

// App styles
import '@styles/styles.scss'

// Plugins
import { router } from '@/plugins/1.router'
import { store } from '@/plugins/2.pinia'
import vuetify from '@/plugins/vuetify'
import '@/plugins/webfontloader'

// Theme — restore saved preference or default to dark
import { useNatcaTheme } from '@natca-itc/ui-shell'

// Create vue app
const app = createApp(App)

// Register plugins
app.use(createHead())
app.use(store)
app.use(router)
app.use(vuetify)

// Initialize theme after Vuetify is registered
const { setTheme } = useNatcaTheme()
setTheme(localStorage.getItem('natca-theme') ?? 'dark')

// Mount vue app
app.mount('#app')
