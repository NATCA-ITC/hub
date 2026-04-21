import { ref, inject } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Member, MemberWithDetails, Position, Facility, Region } from '@/plugins/supabase'
import { MemberService } from '@/services/memberService'

export function useSupabase() {
  const supabase = inject<SupabaseClient>('supabase')

  if (!supabase) {
    throw new Error('Supabase client not found. Make sure to install the Supabase plugin.')
  }

  const loading = ref(false)
  const error = ref<string | null>(null)

  const getMember = async (memberNumber: string): Promise<Member | null> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('members')
        .select('*')
        .eq('member_number', memberNumber)
        .single()

      if (supabaseError) {
        error.value = supabaseError.message
        return null
      }

      return data as Member
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const getMemberPositions = async (memberNumber: string): Promise<Position[]> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('positions')
        .select('*')
        .eq('member_number', memberNumber)
        .order('start_date', { ascending: false })

      if (supabaseError) {
        error.value = supabaseError.message
        return []
      }

      return data as Position[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return []
    } finally {
      loading.value = false
    }
  }

  const getFacilities = async (): Promise<Facility[]> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('facilities')
        .select('*')
        .order('name')

      if (supabaseError) {
        error.value = supabaseError.message
        return []
      }

      return data as Facility[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return []
    } finally {
      loading.value = false
    }
  }

  const getFacility = async (facilityCode: string): Promise<Facility | null> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('facilities')
        .select('*')
        .eq('code', facilityCode)
        .single()

      if (supabaseError) {
        error.value = supabaseError.message
        return null
      }

      return data as Facility
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const getMemberWithDetails = async (memberNumber: string): Promise<MemberWithDetails | null> => {
    try {
      loading.value = true
      error.value = null

      const member = await MemberService.getMemberWithDetails(memberNumber)
      return member
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const getCurrentMembers = async (limit: number = 50): Promise<Member[]> => {
    try {
      loading.value = true
      error.value = null

      const members = await MemberService.getCurrentMembers(limit)
      return members
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return []
    } finally {
      loading.value = false
    }
  }

  const searchMembers = async (query: string, currentMembersOnly: boolean = true): Promise<Member[]> => {
    if (!query.trim()) return []

    try {
      loading.value = true
      error.value = null

      const members = await MemberService.searchMembers(query, currentMembersOnly)
      return members
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return []
    } finally {
      loading.value = false
    }
  }

  const getRegions = async (): Promise<Region[]> => {
    try {
      loading.value = true
      error.value = null

      const regions = await MemberService.getAllRegions()
      return regions
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,

    // Original methods
    getMember,
    getMemberPositions,
    getFacilities,
    getFacility,

    // New methods with joins and details
    getMemberWithDetails,
    getCurrentMembers,
    searchMembers,
    getRegions,
  }
}