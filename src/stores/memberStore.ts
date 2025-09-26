import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MemberWithDetails } from '@/plugins/supabase'
import { MemberService } from '@/services/memberService'
import { mynatcaApiService, type MyNATCAMemberProfile } from '@/services/mynatcaApiService'

export const useMemberStore = defineStore('member', () => {
  // State
  const currentMember = ref<MemberWithDetails | null>(null)
  const mynatcaProfile = ref<MyNATCAMemberProfile | null>(null)
  const loading = ref(false)
  const mynatcaLoading = ref(false)
  const error = ref<string | null>(null)
  const mynatcaError = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)
  const mynatcaLastFetched = ref<Date | null>(null)

  // Configure MyNATCA API service with Auth0 token provider (deprecated - keeping for compatibility)
  const setupAuthTokenProvider = (getToken: () => string | null) => {
    console.warn('⚠️ setupAuthTokenProvider called but using session-based auth - ignoring')
    // No longer needed with session-based auth through platform proxy
  }

  // Computed
  const memberNumber = computed(() => currentMember.value?.membernumber || null)
  const username = computed(() => currentMember.value?.username || null)
  const fullName = computed(() => {
    if (!currentMember.value) return null
    return `${currentMember.value.firstname} ${currentMember.value.lastname}`
  })
  const facility = computed(() => currentMember.value?.facility || null)
  const region = computed(() => currentMember.value?.region || null)
  const memberType = computed(() => currentMember.value?.member_type || null)

  // Helper computed properties for display
  const facilityCode = computed(() => facility.value?.code || 'N/A')
  const facilityName = computed(() => facility.value?.name || 'Unknown Facility')
  const regionCode = computed(() => region.value?.code || 'N/A')
  const regionName = computed(() => region.value?.name || 'Unknown Region')
  const memberTypeName = computed(() => memberType.value?.type_name || 'Unknown')

  // MyNATCA profile computed properties
  const primaryEmail = computed(() => {
    const emails = mynatcaProfile.value?.emailAddresses || []
    return emails.find(email => email.isprimary)?.email || emails[0]?.email || null
  })

  const allEmails = computed(() => mynatcaProfile.value?.emailAddresses || [])

  const primaryPhone = computed(() => {
    const phones = mynatcaProfile.value?.phones || []
    return phones.find(phone => phone.isprimary)?.number || phones[0]?.number || null
  })

  const allPhones = computed(() => mynatcaProfile.value?.phones || [])

  // Actions
  const fetchMemberData = async (memberNumber: string, natcaId?: number, forceRefresh = false) => {
    // Check if we already have recent data (cache for 5 minutes)
    if (!forceRefresh && currentMember.value && lastFetched.value) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      if (lastFetched.value > fiveMinutesAgo && currentMember.value.membernumber === memberNumber) {
        return currentMember.value
      }
    }

    loading.value = true
    error.value = null

    try {
      console.log('🚀 Fetching member data from Supabase for member:', memberNumber)
    console.log('📡 Making Supabase API call...')
      const memberData = await MemberService.getMemberWithDetails(memberNumber)

      if (memberData) {
        currentMember.value = memberData
        lastFetched.value = new Date()
        console.log('✅ Member data fetched successfully:', {
          name: `${memberData.firstname} ${memberData.lastname}`,
          username: memberData.username || 'No username',
          facility: memberData.facility?.name || 'No facility',
          region: memberData.region?.name || 'No region'
        })

        // Also fetch MyNATCA profile data if natcaId is provided
        if (natcaId) {
          fetchMyNATCAProfile(natcaId)
        }
      } else {
        throw new Error(`Member ${memberNumber} not found`)
      }

      return memberData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch member data'
      error.value = errorMessage
      console.error('❌ Error fetching member data:', errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch MyNATCA profile data
  const fetchMyNATCAProfile = async (natcaId: number, forceRefresh = false) => {
    // Check if we already have recent data (cache for 5 minutes)
    if (!forceRefresh && mynatcaProfile.value && mynatcaLastFetched.value) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      if (mynatcaLastFetched.value > fiveMinutesAgo && mynatcaProfile.value.id === natcaId) {
        return mynatcaProfile.value
      }
    }

    mynatcaLoading.value = true
    mynatcaError.value = null

    try {
      console.log('🌐 Fetching MyNATCA profile for NATCA ID:', natcaId)
      const profileData = await mynatcaApiService.getMemberProfile(natcaId)

      if (profileData) {
        mynatcaProfile.value = profileData
        mynatcaLastFetched.value = new Date()
        console.log('✅ MyNATCA profile fetched successfully:', {
          name: `${profileData.firstname || ''} ${profileData.lastname || ''}`.trim(),
          emails: profileData.emailAddresses?.length || 0,
          phones: profileData.phones?.length || 0,
          data: profileData
        })
      }

      return profileData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch MyNATCA profile'
      mynatcaError.value = errorMessage
      console.error('❌ Error fetching MyNATCA profile:', errorMessage)
      // Don't throw - MyNATCA API might not be available in development
    } finally {
      mynatcaLoading.value = false
    }
  }

  const clearMemberData = () => {
    currentMember.value = null
    mynatcaProfile.value = null
    lastFetched.value = null
    mynatcaLastFetched.value = null
    error.value = null
    mynatcaError.value = null
  }

  const refreshMemberData = () => {
    if (currentMember.value?.membernumber) {
      return fetchMemberData(currentMember.value.membernumber, true)
    }
  }

  return {
    // State
    currentMember,
    mynatcaProfile,
    loading,
    mynatcaLoading,
    error,
    mynatcaError,
    lastFetched,
    mynatcaLastFetched,

    // Computed
    memberNumber,
    username,
    fullName,
    facility,
    region,
    memberType,
    facilityCode,
    facilityName,
    regionCode,
    regionName,
    memberTypeName,

    // MyNATCA profile computed
    primaryEmail,
    allEmails,
    primaryPhone,
    allPhones,

    // Actions
    fetchMemberData,
    fetchMyNATCAProfile,
    clearMemberData,
    refreshMemberData,
    setupAuthTokenProvider
  }
})