// MyNATCA API Service for member profile data
import axios, { type AxiosInstance } from 'axios'

// TypeScript interfaces for MyNATCA API responses
export interface MyNATCAMemberProfile {
  id: number
  firstName: string
  lastName: string
  membershipNumber: string
  emailAddresses: MemberEmail[]
  phoneNumbers: MemberPhone[]
  addresses: MemberAddress[]
  membershipStatus: string
  facility?: string
  region?: string
  // Add other fields as discovered from API
}

export interface MemberEmail {
  id: number
  emailAddress: string
  isPrimary: boolean
  emailType: string
}

export interface MemberPhone {
  id: number
  phoneNumber: string
  isPrimary: boolean
  phoneType: string
}

export interface MemberAddress {
  id: number
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  country: string
  isPrimary: boolean
  addressType: string
}

class MyNATCAApiService {
  private apiClient: AxiosInstance
  private baseURL: string
  private getAuthToken: (() => string | null) | null = null

  constructor() {
    this.baseURL = 'https://my.natca.org'
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      (config) => {
        // Add Auth0 bearer token if available
        const token = this.getAuthToken?.()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('🔐 Adding Auth0 bearer token to MyNATCA API request')

          // Debug: Log token structure (first 50 chars for security)
          console.log('🔍 Token preview:', token.substring(0, 50) + '...')

          // Debug: Decode and log JWT payload for debugging (remove in production)
          try {
            const base64Payload = token.split('.')[1]
            const payload = JSON.parse(atob(base64Payload))
            console.log('🎟️ Token payload preview:', {
              iss: payload.iss,
              aud: payload.aud,
              sub: payload.sub,
              exp: payload.exp,
              scope: payload.scope,
              azp: payload.azp,
              hasNatcaClaims: !!(payload['https://natcaInfo.net/member_no'] || payload['https://natcaInfo.net/natca_id'])
            })
          } catch (err) {
            console.error('❌ Failed to decode token payload:', err)
          }
        } else {
          console.warn('⚠️ No Auth0 token available for MyNATCA API request')
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('❌ MyNATCA API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            hasAuthHeader: !!error.config?.headers?.Authorization
          }
        })

        // Special handling for 401 Unauthorized
        if (error.response?.status === 401) {
          console.error('🚫 Authentication failed with MyNATCA API')
          console.error('💡 This could indicate:')
          console.error('   - Invalid Auth0 audience configuration')
          console.error('   - Missing required scopes in token')
          console.error('   - MyNATCA API expects different token format')
          console.error('   - Token expired or invalid')
        }

        return Promise.reject(error)
      }
    )
  }

  // Set the function to get Auth0 token
  setAuthTokenProvider(tokenProvider: () => string | null) {
    this.getAuthToken = tokenProvider
  }

  // Get member profile by NATCA ID
  async getMemberProfile(natcaId: number): Promise<MyNATCAMemberProfile | null> {
    try {
      console.log('🌐 Calling MyNATCA API for member profile:', natcaId)

      const response = await this.apiClient.get(`/api/Member/${natcaId}`)

      console.log('✅ MyNATCA API response received:', {
        status: response.status,
        hasData: !!response.data,
        memberName: response.data?.firstName && response.data?.lastName
          ? `${response.data.firstName} ${response.data.lastName}`
          : 'Unknown'
      })

      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch member profile from MyNATCA API:', error)

      // In development, this might fail due to CORS or authentication
      if (import.meta.env.DEV) {
        console.warn('🚧 MyNATCA API call failed (expected in development without proper auth)')
        return this.getMockMemberProfile(natcaId)
      }

      throw error
    }
  }

  // Mock data for development/testing
  private getMockMemberProfile(natcaId: number): MyNATCAMemberProfile {
    return {
      id: natcaId,
      firstName: 'John',
      lastName: 'Smith',
      membershipNumber: '40162',
      membershipStatus: 'Active',
      facility: 'Philadelphia TRACON',
      region: 'Eastern',
      emailAddresses: [
        {
          id: 1,
          emailAddress: 'john.smith@example.com',
          isPrimary: true,
          emailType: 'Personal'
        },
        {
          id: 2,
          emailAddress: 'j.smith@natca.net',
          isPrimary: false,
          emailType: 'NATCA'
        }
      ],
      phoneNumbers: [
        {
          id: 1,
          phoneNumber: '(555) 123-4567',
          isPrimary: true,
          phoneType: 'Mobile'
        },
        {
          id: 2,
          phoneNumber: '(555) 987-6543',
          isPrimary: false,
          phoneType: 'Home'
        }
      ],
      addresses: [
        {
          id: 1,
          addressLine1: '123 Aviation Way',
          city: 'Philadelphia',
          state: 'PA',
          zipCode: '19153',
          country: 'USA',
          isPrimary: true,
          addressType: 'Home'
        }
      ]
    }
  }

  // Update member profile (for future use)
  async updateMemberProfile(natcaId: number, profileData: Partial<MyNATCAMemberProfile>): Promise<boolean> {
    try {
      const response = await this.apiClient.put(`/api/Member/UpdateMemberProfile`, {
        id: natcaId,
        ...profileData
      })
      return response.status === 200
    } catch (error) {
      console.error('Failed to update member profile:', error)
      return false
    }
  }

  // Update member email addresses
  async updateMemberEmails(natcaId: number, emails: MemberEmail[]): Promise<boolean> {
    try {
      const response = await this.apiClient.put(`/api/Member/UpdateMemberEmailAddresses`, {
        memberId: natcaId,
        emailAddresses: emails
      })
      return response.status === 200
    } catch (error) {
      console.error('Failed to update member emails:', error)
      return false
    }
  }

  // Update member phone numbers
  async updateMemberPhones(natcaId: number, phones: MemberPhone[]): Promise<boolean> {
    try {
      const response = await this.apiClient.put(`/api/Member/UpdateMemberPhones`, {
        memberId: natcaId,
        phoneNumbers: phones
      })
      return response.status === 200
    } catch (error) {
      console.error('Failed to update member phones:', error)
      return false
    }
  }
}

export const mynatcaApiService = new MyNATCAApiService()