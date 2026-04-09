import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import defaults from './defaults'
import { icons } from './icons'
import { themes } from './theme'

const vuetify = createVuetify({
  aliases: {
    IconBtn: VBtn,
  },
  defaults,
  icons,
  theme: {
    defaultTheme: 'dark',
    themes,
  },
})

export default vuetify
