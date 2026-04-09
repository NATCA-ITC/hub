import { createClient } from '@supabase/supabase-js'

export interface Member {
  membernumber: string
  firstname: string
  lastname: string
  username?: string
  facility_id: string
  region_id: string
  membertypeid: number // 6 = Current Member
  email?: string
  discord_id?: string
  auth0_user_id?: string
  created_at: string
  updated_at: string
}

export interface MemberWithDetails extends Member {
  facility?: Facility
  region?: Region
  member_type?: MemberType
}

export interface Region {
  id: number
  code: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface MemberType {
  id: number
  type_name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Position {
  id: number
  membernumber: string
  positiontype: string
  facility_id: string
  start_date: string
  end_date?: string
}

export interface Facility {
  id: number
  code: string
  name: string
  region_id: number
  level?: string
  latitude?: number
  longitude?: number
  facility_type: string
  status: string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Public schema client — shared read-only tables (members, facilities, regions, positions)
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

// Hub schema client — hub-specific tables (user_preferences, etc.)
export const hubDb = {
  from: (table: string) => supabase.schema('hub').from(table),
}
