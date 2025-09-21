import { ref, computed, onMounted } from 'vue'
import { createAuth0Client, type Auth0Client, type User } from '@auth0/auth0-spa-js'

// Auth0 configuration - Simple SPA setup (no API/audience like other NATCA systems)
const AUTH0_CONFIG = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || 'natca-dev.us.auth0.com',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  authorizationParams: {
    redirect_uri: window.location.origin,
    scope: 'openid profile email'
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: false
}

// Global state
const isLoading = ref(true)
const isAuthenticated = ref(false)
const user = ref<User | null>(null)
const accessToken = ref<string | null>(null)
const idToken = ref<string | null>(null)
const idTokenClaims = ref<any | null>(null)
const error = ref<string | null>(null)

let auth0Client: Auth0Client | null = null

// Extract member profile from token
const extractMemberProfile = (token: string, userInfo: User) => {
  try {
    if (!token || typeof token !== 'string') {
      console.warn('Invalid token provided to extractMemberProfile')
      return null
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('Token does not have 3 parts, not a valid JWT')
      return null
    }

    const base64Payload = parts[1]
    if (!base64Payload) {
      console.warn('Token payload is empty')
      return null
    }

    console.log('🔍 Decoding token payload...')
    const payload = JSON.parse(atob(base64Payload))
    console.log('📋 Full token payload:', payload)

    const profile = {
      id: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      memberNumber: payload['https://natcaInfo.net/member_no'] || '40162',
      natcaId: payload['https://natcaInfo.net/natca_id'] || 12985,
      facility: payload.facility || 'PHL',
      region: payload.region || 'Eastern',
      positions: payload.positions || ['Controller'],
      status: payload.status || 'Active'
    }

    console.log('✅ Extracted member profile:', profile)
    return profile
  } catch (err) {
    console.error('Error extracting member profile:', err)
    console.log('🔍 Token that failed:', token?.substring(0, 100) + '...')
    return null
  }
}

const memberProfile = computed(() => {
  if (!idTokenClaims.value || !user.value) return null

  console.log('🔍 Computing member profile from ID token claims')

  const claims = idTokenClaims.value
  const profile = {
    id: user.value.sub,
    name: user.value.name,
    email: user.value.email,
    picture: user.value.picture,
    memberNumber: claims['https://natcaInfo.net/member_no'] || '40162',
    natcaId: claims['https://natcaInfo.net/natca_id'] || 12985,
    username: claims['https://natcaInfo.net/username'] || '',
    firstName: claims['https://natcaInfo.net/firstname'] || '',
    lastName: claims['https://natcaInfo.net/lastname'] || '',
    regionId: claims['https://natcaInfo.net/region_id'] || null,
    facility: claims.facility || 'PHL',
    region: claims.region || 'Eastern',
    positions: claims.positions || ['Controller'],
    status: claims.status || 'Active'
  }

  console.log('✅ Member profile computed:', profile)
  return profile
})

// Initialize Auth0
const initializeAuth0 = async () => {
  try {
    console.log('🔧 Initializing Auth0...')
    isLoading.value = true
    error.value = null

    // Create Auth0 client
    auth0Client = await createAuth0Client(AUTH0_CONFIG)

    // Handle callback if present
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      console.log('🔄 Handling Auth0 callback...')
      await auth0Client.handleRedirectCallback()
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Check authentication status (without silent authentication to avoid 400 errors)
    const authenticated = await auth0Client.isAuthenticated()
    isAuthenticated.value = authenticated

    if (authenticated) {
      try {
        user.value = await auth0Client.getUser() || null

        // Get both ID token (for member profile) and access token (for API calls)
        idTokenClaims.value = await auth0Client.getIdTokenClaims()
        idToken.value = idTokenClaims.value?.__raw || null
        console.log('🆔 ID Token claims:', idTokenClaims.value)
        console.log('🔑 Raw ID Token:', idToken.value?.substring(0, 50) + '...')

        // Only get access token if we're authenticated
        accessToken.value = await auth0Client.getTokenSilently({
          ignoreCache: false
        })

        // Store in localStorage for API calls
        if (accessToken.value) {
          localStorage.setItem('auth_token', accessToken.value)
        }

        console.log('✅ Auth0 initialized - user authenticated')
        console.log('🔑 Access token available:', !!accessToken.value)
      } catch (tokenError) {
        console.warn('⚠️ Could not get token silently, user needs to re-authenticate')
        // Clear auth state if token retrieval fails
        isAuthenticated.value = false
        user.value = null
        accessToken.value = null
        idTokenClaims.value = null
        localStorage.removeItem('auth_token')
      }
    } else {
      console.log('✅ Auth0 initialized - user not authenticated')
      localStorage.removeItem('auth_token')
    }
  } catch (err: any) {
    error.value = err.message || 'Authentication initialization failed'
    console.error('❌ Auth0 initialization error:', err)
  } finally {
    isLoading.value = false
  }
}

// Login function
const login = async () => {
  if (!auth0Client) {
    console.error('Auth0 client not initialized')
    return
  }

  try {
    await auth0Client.loginWithRedirect()
  } catch (err: any) {
    error.value = err.message || 'Login failed'
    console.error('Login error:', err)
  }
}

// Logout function
const logout = async () => {
  if (!auth0Client) return

  try {
    localStorage.removeItem('auth_token')
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    })
  } catch (err: any) {
    error.value = err.message || 'Logout failed'
    console.error('Logout error:', err)
  }
}

// Get fresh token
const getToken = async () => {
  if (!auth0Client || !isAuthenticated.value) return null

  try {
    return await auth0Client.getTokenSilently()
  } catch (err) {
    console.error('Failed to get token:', err)
    return null
  }
}

// Computed properties for member data
const memberNumber = computed(() => memberProfile.value?.memberNumber)
const facility = computed(() => memberProfile.value?.facility)
const region = computed(() => memberProfile.value?.region)
const positions = computed(() => memberProfile.value?.positions || [])

// Ensure initialized function for router guards
const ensureInitialized = async () => {
  if (auth0Client === null) {
    await initializeAuth0()
  }
}

// Auth0 composable
export const useAuth0 = () => {
  // Initialize on first use
  if (auth0Client === null && !isLoading.value) {
    initializeAuth0()
  }

  return {
    // State
    isLoading,
    isAuthenticated,
    user,
    accessToken,
    idToken,
    memberProfile,
    error,

    // Member data
    memberNumber,
    facility,
    region,
    positions,

    // Actions
    login,
    logout,
    getToken,
    initializeAuth0,
    ensureInitialized
  }
}

// Clear any existing Auth0 localStorage cache to prevent issues
if (typeof window !== 'undefined') {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('@@auth0spajs@@')) {
      localStorage.removeItem(key)
    }
  })
}

// Auto-initialize Auth0
initializeAuth0()