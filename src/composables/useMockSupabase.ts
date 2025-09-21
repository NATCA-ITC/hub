import { ref } from 'vue'
import type { Member, Position, Facility } from '@/plugins/supabase'

// Mock member data
const mockMember: Member = {
  member_number: '123456',
  first_name: 'John',
  last_name: 'Smith',
  facility_code: 'ATL',
  region_code: 'Eastern',
  member_type_id: 1,
  email: 'john.smith@example.com',
  discord_id: 'discord123456',
  created_at: '2023-01-15T10:30:00Z',
  updated_at: '2024-09-19T16:45:00Z',
}

// Mock positions data
const mockPositions: Position[] = [
  {
    id: 1,
    member_number: '123456',
    position_type: 'Controller',
    facility_code: 'ATL',
    start_date: '2020-03-15',
  },
  {
    id: 2,
    member_number: '123456',
    position_type: 'Supervisor',
    facility_code: 'ATL',
    start_date: '2022-08-01',
  },
  {
    id: 3,
    member_number: '123456',
    position_type: 'Safety Representative',
    facility_code: 'ATL',
    start_date: '2023-01-10',
  },
]

// Mock facilities data
const mockFacilities: Facility[] = [
  {
    facility_code: 'ATL',
    facility_name: 'Hartsfield-Jackson Atlanta International Airport',
    region_code: 'Eastern',
    facility_type: 'TRACON',
    status: 'active',
  },
  {
    facility_code: 'DFW',
    facility_name: 'Dallas/Fort Worth International Airport',
    region_code: 'Southwest',
    facility_type: 'TRACON',
    status: 'active',
  },
  {
    facility_code: 'LAX',
    facility_name: 'Los Angeles International Airport',
    region_code: 'Western Pacific',
    facility_type: 'TRACON',
    status: 'active',
  },
  {
    facility_code: 'ORD',
    facility_name: 'Chicago O\'Hare International Airport',
    region_code: 'Great Lakes',
    facility_type: 'TRACON',
    status: 'active',
  },
  {
    facility_code: 'JFK',
    facility_name: 'John F. Kennedy International Airport',
    region_code: 'Eastern',
    facility_type: 'TRACON',
    status: 'active',
  },
  {
    facility_code: 'MIA',
    facility_name: 'Miami International Airport',
    region_code: 'Southern',
    facility_type: 'TRACON',
    status: 'active',
  },
  {
    facility_code: 'SEA',
    facility_name: 'Seattle-Tacoma International Airport',
    region_code: 'Northwest Mountain',
    facility_type: 'TRACON',
    status: 'active',
  },
  {
    facility_code: 'PHX',
    facility_name: 'Phoenix Sky Harbor International Airport',
    region_code: 'Southwest',
    facility_type: 'TRACON',
    status: 'active',
  },
  {
    facility_code: 'DEN',
    facility_name: 'Denver International Airport',
    region_code: 'Northwest Mountain',
    facility_type: 'TRACON',
    status: 'active',
  },
  {
    facility_code: 'LAS',
    facility_name: 'Harry Reid International Airport',
    region_code: 'Western Pacific',
    facility_type: 'TRACON',
    status: 'active',
  },
]

export function useMockSupabase() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getMember = async (memberNumber: string): Promise<Member | null> => {
    loading.value = true
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    loading.value = false

    if (memberNumber === '123456') {
      return mockMember
    }
    return null
  }

  const getMemberPositions = async (memberNumber: string): Promise<Position[]> => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    loading.value = false

    if (memberNumber === '123456') {
      return mockPositions
    }
    return []
  }

  const getFacilities = async (): Promise<Facility[]> => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 400))
    loading.value = false

    return mockFacilities
  }

  const getFacility = async (facilityCode: string): Promise<Facility | null> => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 200))
    loading.value = false

    return mockFacilities.find(f => f.facility_code === facilityCode) || null
  }

  return {
    loading,
    error,
    getMember,
    getMemberPositions,
    getFacilities,
    getFacility,
  }
}