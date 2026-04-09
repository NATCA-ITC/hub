// Member Service with Supabase integration and proper joins
import { supabase } from '@/plugins/supabase'
import type { Member, MemberWithDetails, Region, Facility, MemberType } from '@/plugins/supabase'

export class MemberService {
  // Get a member by member number with full details (includes region and facility)
  static async getMemberWithDetails(memberNumber: string): Promise<MemberWithDetails | null> {
    try {
      // First get the member
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('membernumber', memberNumber)
        .single()

      if (memberError) throw memberError
      if (!member) return null

      const memberTypeId = member.member_type_id || 6

      // Get related data in parallel
      const [facilityResult, regionResult, memberTypeResult] = await Promise.allSettled([
        this.getFacilityById(member.facility_id),
        this.getRegionById(member.region_id),
        this.getMemberTypeById(memberTypeId)
      ])

      return {
        ...member,
        facility: facilityResult.status === 'fulfilled' ? facilityResult.value : undefined,
        region: regionResult.status === 'fulfilled' ? regionResult.value : undefined,
        member_type: memberTypeResult.status === 'fulfilled' ? memberTypeResult.value : undefined
      }
    } catch (error) {
      console.error('Error fetching member with details:', error)
      throw error
    }
  }

  // Get current members (member_type_id = 6)
  static async getCurrentMembers(limit: number = 50): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('member_type_id', 6) // Current members only
        .order('lastname')
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching current members:', error)
      return []
    }
  }

  // Get facility by ID
  static async getFacilityById(facilityId: string): Promise<Facility | null> {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.warn(`Facility ${facilityId} not found:`, error)
      return null
    }
  }

  // Get region by ID
  static async getRegionById(regionId: string): Promise<Region | null> {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('id', regionId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.warn(`Region ${regionId} not found:`, error)
      return null
    }
  }

  // Get member type by ID (hardcoded mappings)
  static async getMemberTypeById(memberTypeId: number): Promise<MemberType | null> {
    try {
      const memberTypes: { [key: number]: MemberType } = {
        6: { id: 6, type_name: 'Current Member', description: 'Active NATCA member' },
        8: { id: 8, type_name: 'NATCA Employee', description: 'NATCA staff member' },
        10: { id: 10, type_name: 'Retired Member', description: 'Retired NATCA member' }
      }

      const memberType = memberTypes[memberTypeId]
      return memberType || null
    } catch (error) {
      console.warn(`Error getting member type ${memberTypeId}:`, error)
      return null
    }
  }

  // Get all facilities
  static async getAllFacilities(): Promise<Facility[]> {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('facility_name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching facilities:', error)
      return []
    }
  }

  // Get all regions
  static async getAllRegions(): Promise<Region[]> {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('region_name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching regions:', error)
      return []
    }
  }

  // Search members by name or member number
  static async searchMembers(query: string, currentMembersOnly: boolean = true): Promise<Member[]> {
    try {
      let supabaseQuery = supabase
        .from('members')
        .select('*')

      if (currentMembersOnly) {
        supabaseQuery = supabaseQuery.eq('member_type_id', 6)
      }

      // Search in first name, last name, or member number
      const { data, error } = await supabaseQuery
        .or(`firstname.ilike.%${query}%,lastname.ilike.%${query}%,membernumber.eq.${query}`)
        .order('lastname')
        .limit(20)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching members:', error)
      return []
    }
  }
}