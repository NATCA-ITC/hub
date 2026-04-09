// MyNATCA API Service for member profile data
import axios, { type AxiosInstance } from 'axios'

// TypeScript interfaces for MyNATCA API responses
export interface MyNATCAMemberProfile {
  id: number
  firstname: string
  lastname: string
  middlename?: string
  membernumber: string
  emailAddresses: MemberEmail[]
  phones: MemberPhone[]
  addresses: MemberAddress[]
  status: string
  facility?: MyNATCAFacility
  region?: MyNATCARegion
  username?: string
  nickname?: string
  dateofbirth?: string
  // Add other fields as discovered from API
}

export interface MyNATCAFacility {
  id: number
  code: string
  description: string
  region?: string
}

export interface MyNATCARegion {
  id: number
  code: string
  description: string
}

export interface MemberEmail {
  id: number
  email: string
  isprimary: boolean
}

export interface MemberPhone {
  id: number
  number: string
  isprimary: boolean
  phonetype: string
  phonetypeid: number
  isVerified?: boolean
}

export interface MemberAddress {
  id: number
  address1: string
  address2?: string
  address3?: string
  city: string
  state: string
  zipcode: string
  county?: string
  isprimary: boolean
  addresstypeid: number
  addressid: number
  isValidAddress: boolean
}

class MyNATCAApiService {
  private apiClient: AxiosInstance
  private baseURL: string
  private getAuthToken: (() => string | null) | null = null

  constructor() {
    // Use relative URLs to leverage Vite proxy to platform
    this.baseURL = '/api/mynatca'
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      withCredentials: true, // Important: include cookies for session auth
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Add request interceptor for session-based auth
    this.apiClient.interceptors.request.use(
      (config) => {
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
        // Quiet failure — MyNATCA API is supplemental data, not critical
        if (error.response?.status === 401) {
          console.warn('MyNATCA API: auth proxy not configured (expected in local dev)')
        } else if (error.code === 'ECONNABORTED') {
          console.warn('MyNATCA API: request timed out')
        } else {
          console.warn('MyNATCA API error:', error.response?.status || error.message)
        }

        return Promise.reject(error)
      }
    )
  }

  // Set the function to get Auth0 token (deprecated - keeping for compatibility)
  setAuthTokenProvider(tokenProvider: () => string | null) {
    // Session-based auth — token provider not needed
    // No longer needed with session-based auth
  }

  // Get member profile by NATCA ID
  async getMemberProfile(natcaId: number): Promise<MyNATCAMemberProfile | null> {
    try {
      console.log('🌐 Calling MyNATCA API via platform for member profile:', natcaId)

      const response = await this.apiClient.get(`/Member/${natcaId}`)

      // Check if response is HTML (indicating we hit a frontend website instead of API)
      if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
        console.warn('🚧 MyNATCA API returned HTML instead of JSON - using mock data')
        return this.getMockMemberProfile(natcaId)
      }

      // Handle wrapped response structure { status: "Success", data: {...} }
      const actualData = response.data?.status === 'Success' ? response.data.data : response.data

      console.log('✅ MyNATCA API response received:', {
        status: response.status,
        hasData: !!actualData,
        memberName: actualData?.firstname && actualData?.lastname
          ? `${actualData.firstname} ${actualData.lastname}`
          : 'Unknown'
      })

      return actualData
    } catch (error) {
      console.error('❌ Failed to fetch member profile from MyNATCA API:', error)

      // In development, this might fail due to platform connectivity or authentication
      if (import.meta.env.DEV) {
        console.warn('🚧 MyNATCA API call via platform failed (expected if platform not running)')
        return this.getMockMemberProfile(natcaId)
      }

      throw error
    }
  }

  // Mock data for development/testing
  private getMockMemberProfile(natcaId: number): MyNATCAMemberProfile {
    return {
      id: natcaId,
      firstname: 'John',
      lastname: 'Smith',
      membernumber: '40162',
      status: 'Active',
      facility: {
        id: 123,
        code: 'PHL',
        description: 'Philadelphia TRACON'
      },
      region: {
        id: 2,
        code: 'EAS',
        description: 'Eastern'
      },
      emailAddresses: [
        {
          id: 1,
          email: 'john.smith@example.com',
          isprimary: true
        },
        {
          id: 2,
          email: 'j.smith@natca.net',
          isprimary: false
        }
      ],
      phones: [
        {
          id: 1,
          number: '(555) 123-4567',
          isprimary: true,
          phonetype: 'Cell',
          phonetypeid: 1
        },
        {
          id: 2,
          number: '(555) 987-6543',
          isprimary: false,
          phonetype: 'Home',
          phonetypeid: 3
        }
      ],
      addresses: [
        {
          id: 1,
          address1: '123 Aviation Way',
          city: 'Philadelphia',
          state: 'PA',
          zipcode: '19153',
          isprimary: true,
          addresstypeid: 1,
          addressid: 1001,
          isValidAddress: true
        }
      ]
    }
  }

  // Update member profile (for future use)
  async updateMemberProfile(natcaId: number, profileData: Partial<MyNATCAMemberProfile>): Promise<boolean> {
    try {
      const response = await this.apiClient.put(`/Member/UpdateMemberProfile`, {
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
      const response = await this.apiClient.put(`/Member/UpdateMemberEmailAddresses`, {
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
      const response = await this.apiClient.put(`/Member/UpdateMemberPhones`, {
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