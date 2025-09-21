import { ref, computed } from 'vue'

// Mock authentication state for demo purposes
const mockUser = {
  sub: 'auth0|demo12345',
  name: 'John Smith',
  email: 'john.smith@example.com',
  picture: 'https://via.placeholder.com/150',
  'https://mynatca.org/member_number': 123456,
  'https://mynatca.org/positions': ['Controller', 'Supervisor', 'Safety Rep'],
  'https://mynatca.org/region': 'Eastern',
  'https://mynatca.org/facility': 'ATL'
}

export function useMockAuth() {
  const user = ref(mockUser)
  const isAuthenticated = ref(true)
  const isLoading = ref(false)

  const memberNumber = computed(() => {
    return user.value?.['https://mynatca.org/member_number'] || null
  })

  const positions = computed(() => {
    return user.value?.['https://mynatca.org/positions'] || []
  })

  const region = computed(() => {
    return user.value?.['https://mynatca.org/region'] || null
  })

  const facility = computed(() => {
    return user.value?.['https://mynatca.org/facility'] || null
  })

  const login = async () => {
    console.log('Mock login - already authenticated')
  }

  const logout = () => {
    console.log('Mock logout')
  }

  const getAccessToken = async () => {
    return 'mock_access_token'
  }

  const checkAuth = async () => {
    // Already authenticated in mock mode
  }

  return {
    user: computed(() => user.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    memberNumber,
    positions,
    region,
    facility,
    login,
    logout,
    getAccessToken,
    checkAuth,
  }
}