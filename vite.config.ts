import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports, getPascalCaseRouteName } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import MetaLayouts from 'vite-plugin-vue-meta-layouts'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 1302,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:1300',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
      },
    },
  },
  plugins: [
    VueRouter({
      getRouteName: routeNode => {
        return getPascalCaseRouteName(routeNode)
          .replace(/([a-z\d])([A-Z])/g, '$1-$2')
          .toLowerCase()
      },
    }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'swiper-container' || tag === 'swiper-slide',
        },
      },
    }),
    VueDevTools(),
    vueJsx(),

    vuetify({
      styles: {
        configFile: 'src/assets/styles/variables/_vuetify.scss',
      },
    }),

    MetaLayouts({
      target: './src/layouts',
      defaultLayout: 'default',
    }),

    Components({
      dirs: ['src/components'],
      dts: true,
      resolvers: [
        componentName => {
          if (componentName === 'VueApexCharts')
            return { name: 'default', from: 'vue3-apexcharts', as: 'VueApexCharts' }
        },
      ],
    }),

    AutoImport({
      imports: ['vue', VueRouterAutoImports, '@vueuse/core', '@vueuse/math', 'pinia'],
      dirs: [
        './src/composables/',
        './src/utils/',
      ],
      vueTemplate: true,
      ignore: ['useCookies', 'useStorage'],
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images/', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/assets/styles/', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  optimizeDeps: {
    exclude: ['vuetify'],
    entries: [
      './src/**/*.vue',
    ],
  },
})
