import { setupLayouts } from 'virtual:meta-layouts'
import type { App } from 'vue'

import type { RouteRecordRaw } from 'vue-router/auto'

import { createRouter, createWebHistory } from 'vue-router/auto'
import { useAuth0 } from '@/composables/useAuth0'

function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])

    return route
  }

  return setupLayouts([route])[0]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }

    return { top: 0 }
  },
  extendRoutes: pages => [
    ...[...pages].map(route => recursiveLayouts(route)),
  ],
})

// Authentication guard
router.beforeEach(async (to, from, next) => {
  // Skip authentication check for login page and other public routes
  const publicRoutes = ['/', '/login', '/index-basic']
  const isPublicRoute = publicRoutes.includes(to.path) || to.meta?.public === true

  const { isAuthenticated, isLoading, ensureInitialized } = useAuth0()

  // Ensure Auth0 is initialized
  await ensureInitialized()

  // Wait for loading to complete
  while (isLoading.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Authenticated users can access home page - no redirect needed
  // The index.vue page handles both authenticated and unauthenticated states

  if (isPublicRoute) {
    next()
    return
  }

  if (isAuthenticated.value) {
    next()
  } else {
    // Redirect to home page where login happens
    next('/')
  }
})

export { router }

export default function (app: App) {
  app.use(router)
}
