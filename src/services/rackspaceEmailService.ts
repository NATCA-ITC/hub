/**
 * Rackspace Email Service
 * Handles API calls to Platform for natca.net email management
 */

export interface EmailAvailabilityOption {
  email: string
  available: boolean
}

export interface EmailAvailabilityResponse {
  success: boolean
  memberNumber: string
  member: {
    firstname: string
    lastname: string
  }
  options: EmailAvailabilityOption[]
}

export interface CreateEmailResponse {
  success: boolean
  email: string
  password: string
  message: string
}

export interface ResetPasswordResponse {
  success: boolean
  email: string
  password: string
  message: string
}

export interface ErrorResponse {
  error: string
  details?: string
  email?: string
}

class RackspaceEmailService {
  private baseUrl = '/api/rackspace'

  /**
   * Check email availability for a member
   */
  async checkAvailability(memberNumber: string): Promise<EmailAvailabilityResponse> {
    const response = await fetch(`${this.baseUrl}/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookie
      body: JSON.stringify({ memberNumber }),
    })

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.error || 'Failed to check email availability')
    }

    return await response.json()
  }

  /**
   * Create a new natca.net email account
   */
  async createEmail(memberNumber: string, emailFormat: string): Promise<CreateEmailResponse> {
    const response = await fetch(`${this.baseUrl}/create-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookie
      body: JSON.stringify({ memberNumber, emailFormat }),
    })

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.error || 'Failed to create email account')
    }

    return await response.json()
  }

  /**
   * Reset password for existing natca.net email
   */
  async resetPassword(memberNumber: string): Promise<ResetPasswordResponse> {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookie
      body: JSON.stringify({ memberNumber }),
    })

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.error || 'Failed to reset password')
    }

    return await response.json()
  }

  /**
   * Find the first available email format by incrementing with numbers
   */
  findAvailableFormat(options: EmailAvailabilityOption[]): string | null {
    // First, check if any of the base options are available
    const availableOption = options.find(opt => opt.available)
    if (availableOption) {
      // Return just the part before @natca.net
      return availableOption.email.split('@')[0]
    }
    return null
  }

  /**
   * Generate incremented email options when base options are taken
   */
  generateIncrementedOptions(baseFormat: string, startNum: number = 1, count: number = 5): string[] {
    const options: string[] = []
    for (let i = startNum; i <= startNum + count - 1; i++) {
      options.push(`${baseFormat}${i}`)
    }
    return options
  }
}

export const rackspaceEmailService = new RackspaceEmailService()
