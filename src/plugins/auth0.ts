import { Auth0Client } from '@auth0/auth0-spa-js'
import type { App } from 'vue'

export interface Auth0User {
  sub: string
  email?: string
  name?: string
  picture?: string
  'https://mynatca.org/member_number'?: number
  'https://mynatca.org/positions'?: string[]
  'https://mynatca.org/region'?: string
  'https://mynatca.org/facility'?: string
}

export interface Auth0Plugin {
  auth0: any
  isAuthenticated: () => Promise<boolean>
  getUser: () => Promise<Auth0User | undefined>
  loginWithRedirect: () => Promise<void>
  logout: () => void
  getAccessToken: () => Promise<string>
}

export default function (app: App) {
  const auth0 = new Auth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      redirect_uri: window.location.origin,
    },
  })

  const plugin: Auth0Plugin = {
    auth0,
    async isAuthenticated() {
      return await auth0.isAuthenticated()
    },
    async getUser() {
      return await auth0.getUser() as Auth0User | undefined
    },
    async loginWithRedirect() {
      await auth0.loginWithRedirect()
    },
    logout() {
      auth0.logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      })
    },
    async getAccessToken() {
      return await auth0.getTokenSilently()
    },
  }

  app.provide('auth0', plugin)
  app.config.globalProperties.$auth0 = plugin
}