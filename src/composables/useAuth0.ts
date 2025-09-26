import { ref, computed, onMounted } from 'vue'

// Platform OAuth 2.0 configuration
const PLATFORM_CONFIG = {
  baseUrl: import.meta.env.DEV ? '' : 'https://my.natca.org', // Use relative URLs in dev for Vite proxy
  loginUrl: '/api/auth/login',
  logoutUrl: '/api/auth/logout',
  sessionUrl: '/api/auth/session'
}

// User interface compatible with Auth0 User type
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

// Session data from platform
let sessionData: any = null

// Cleanup old Auth0 localStorage data
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

  console.log('🔍 Computing member profile from session data')
  console.log('🔍 Full sessionData:', sessionData)
  console.log('🔍 sessionData.user:', sessionData.user)
  console.log('🔍 sessionData.user?.natcaId:', sessionData.user?.natcaId)
  console.log('🔍 sessionData.natcaId:', sessionData.natcaId)

  const profile = {
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
    facility: sessionData.facility || 'PHL',
    region: sessionData.region || 'Eastern',
    positions: sessionData.positions || ['Controller'],
    status: sessionData.status || 'Active'
  }

  console.log('✅ Member profile computed:', profile)
  return profile
})

// Initialize Platform Authentication
const initializeAuth0 = async () => {
  try {
    console.log('🔧 Initializing Platform Authentication...')
    isLoading.value = true
    error.value = null

    // Check current session with platform
    const response = await fetch(`${PLATFORM_CONFIG.baseUrl}${PLATFORM_CONFIG.sessionUrl}`, {
      credentials: 'include', // Important: include cookies for session
      headers: {
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      sessionData = await response.json()

      if (sessionData && sessionData.user) {
        console.log('✅ Platform session found:', sessionData)

        // Set authentication state
        isAuthenticated.value = true
        user.value = {
          sub: sessionData.user.id || sessionData.user.sub,
          name: sessionData.user.name,
          email: sessionData.user.email,
          picture: sessionData.user.picture
        }

        // For backward compatibility, set token-related fields
        // These will be null since we're using session-based auth
        accessToken.value = null
        idToken.value = null
        idTokenClaims.value = sessionData.user

        console.log('✅ Platform auth initialized - user authenticated')
      } else {
        console.log('✅ Platform auth initialized - user not authenticated')
        isAuthenticated.value = false
        user.value = null
        sessionData = null
      }
    } else {
      console.log('✅ Platform auth initialized - no active session')
      isAuthenticated.value = false
      user.value = null
      sessionData = null
    }

    // Clean up old Auth0 localStorage data
    cleanupOldAuthData()

  } catch (err: any) {
    error.value = err.message || 'Platform authentication initialization failed'
    console.error('❌ Platform auth initialization error:', err)
    isAuthenticated.value = false
    user.value = null
    sessionData = null
  } finally {
    isLoading.value = false
  }
}

// Login function
const login = async (returnTo?: string) => {
  try {
    // Build login URL with returnTo parameter
    const currentUrl = returnTo || window.location.href
    const loginUrl = `${PLATFORM_CONFIG.baseUrl}${PLATFORM_CONFIG.loginUrl}?returnTo=${encodeURIComponent(currentUrl)}`

    console.log('🔄 Redirecting to platform login:', loginUrl)
    window.location.href = loginUrl
  } catch (err: any) {
    error.value = err.message || 'Login failed'
    console.error('Login error:', err)
  }
}

// Logout function
const logout = async () => {
  try {
    // Clear local state
    isAuthenticated.value = false
    user.value = null
    sessionData = null
    accessToken.value = null
    idToken.value = null
    idTokenClaims.value = null

    // Call platform logout endpoint
    const logoutUrl = `${PLATFORM_CONFIG.baseUrl}${PLATFORM_CONFIG.logoutUrl}`
    console.log('🔄 Redirecting to platform logout:', logoutUrl)
    window.location.href = logoutUrl
  } catch (err: any) {
    error.value = err.message || 'Logout failed'
    console.error('Logout error:', err)
  }
}

// Get fresh token (returns null for session-based auth)
const getToken = async () => {
  if (!isAuthenticated.value) return null

  // With session-based auth, we don't need tokens
  // API calls will be made through the platform proxy with session cookies
  console.warn('⚠️ getToken() called but using session-based auth - returning null')
  return null
}

// Computed properties for member data
const memberNumber = computed(() => memberProfile.value?.memberNumber)
const facility = computed(() => memberProfile.value?.facility)
const region = computed(() => memberProfile.value?.region)
const positions = computed(() => memberProfile.value?.positions || [])

// Ensure initialized function for router guards
const ensureInitialized = async () => {
  if (sessionData === null && !isLoading.value) {
    await initializeAuth0()
  }
}

// Platform Auth composable (keeping useAuth0 name for compatibility)
export const useAuth0 = () => {
  // Initialize on first use
  if (sessionData === null && !isLoading.value) {
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

// Auto-initialize Platform Authentication and cleanup old data
cleanupOldAuthData()
initializeAuth0()