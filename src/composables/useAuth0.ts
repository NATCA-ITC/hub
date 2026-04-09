import { ref, computed, onMounted } from 'vue'

// Platform OAuth 2.0 configuration
const PLATFORM_CONFIG = {
  baseUrl: import.meta.env.DEV ? '' : 'https://my.natca.org',
  loginUrl: '/api/auth/login',
  logoutUrl: '/api/auth/logout',
  sessionUrl: '/api/auth/session'
}

interface User {
  sub?: string
  name?: string
  email?: string
  picture?: string
  [key: string]: any
}

// Global state
const isLoading = ref(true)
const isAuthenticated = ref(false)
const user = ref<User | null>(null)
const accessToken = ref<string | null>(null)
const idToken = ref<string | null>(null)
const idTokenClaims = ref<any | null>(null)
const error = ref<string | null>(null)

let sessionData: any = null

const cleanupOldAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('@@auth0spajs@@')) {
        localStorage.removeItem(key)
      }
    })
  }
}

const memberProfile = computed(() => {
  if (!sessionData || !user.value) return null

  return {
    id: user.value.sub,
    name: user.value.name,
    email: user.value.email,
    picture: user.value.picture,
    memberNumber: sessionData.user?.memberNumber || sessionData.memberNumber,
    natcaId: sessionData.user?.natcaId || sessionData.natcaId,
    username: sessionData.username || '',
    firstName: sessionData.firstName || '',
    lastName: sessionData.lastName || '',
    regionId: sessionData.regionId || null,
    facility: sessionData.facility || sessionData.user?.facility || '',
    region: sessionData.region || sessionData.user?.region || '',
    positions: sessionData.positions || [],
    status: sessionData.status || 'Active'
  }
})

const initializeAuth0 = async () => {
  try {
    isLoading.value = true
    error.value = null

    const sessionCheckUrl = `${PLATFORM_CONFIG.baseUrl}${PLATFORM_CONFIG.sessionUrl}`
    const response = await fetch(sessionCheckUrl, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })

    const data = await response.json()

    if (data.authenticated && data.user) {
      sessionData = data
      isAuthenticated.value = true
      user.value = {
        sub: data.user.id || data.user.sub,
        name: data.user.name,
        email: data.user.email,
        picture: data.user.picture
      }
      accessToken.value = null
      idToken.value = null
      idTokenClaims.value = data.user
    } else {
      isAuthenticated.value = false
      user.value = null
      sessionData = null
    }

    cleanupOldAuthData()
  } catch (err: any) {
    console.error('Platform auth error:', err.message)
    error.value = err.message || 'Platform authentication initialization failed'
    isAuthenticated.value = false
    user.value = null
    sessionData = null
  } finally {
    isLoading.value = false
  }
}

const login = async (returnTo?: string) => {
  try {
    const currentUrl = returnTo || window.location.href
    const loginUrl = `${PLATFORM_CONFIG.baseUrl}${PLATFORM_CONFIG.loginUrl}?returnTo=${encodeURIComponent(currentUrl)}`
    window.location.href = loginUrl
  } catch (err: any) {
    error.value = err.message || 'Login failed'
    throw err
  }
}

const logout = async () => {
  try {
    isAuthenticated.value = false
    user.value = null
    sessionData = null
    accessToken.value = null
    idToken.value = null
    idTokenClaims.value = null

    const hubUrl = window.location.origin
    const logoutUrl = `${PLATFORM_CONFIG.baseUrl}${PLATFORM_CONFIG.logoutUrl}?returnTo=${encodeURIComponent(hubUrl)}`
    window.location.href = logoutUrl
  } catch (err: any) {
    error.value = err.message || 'Logout failed'
    console.error('Logout error:', err)
  }
}

const getToken = async () => {
  if (!isAuthenticated.value) return null
  return null
}

const memberNumber = computed(() => memberProfile.value?.memberNumber)
const facility = computed(() => memberProfile.value?.facility)
const region = computed(() => memberProfile.value?.region)
const positions = computed(() => memberProfile.value?.positions || [])

const ensureInitialized = async () => {
  if (sessionData === null && !isLoading.value) {
    await initializeAuth0()
  }
}

export const useAuth0 = () => {
  if (sessionData === null && !isLoading.value) {
    initializeAuth0()
  }

  return {
    isLoading,
    isAuthenticated,
    user,
    accessToken,
    idToken,
    memberProfile,
    error,
    memberNumber,
    facility,
    region,
    positions,
    login,
    logout,
    getToken,
    initializeAuth0,
    ensureInitialized
  }
}

cleanupOldAuthData()
initializeAuth0()
