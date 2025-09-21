import { createClient } from '@supabase/supabase-js'
import type { App } from 'vue'

export interface Member {
  membernumber: string
  firstname: string
  lastname: string
  username?: string
  facility_id: string
  region_id: string
  member_type_id: number // 6 = Current Member
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
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function (app: App) {
  app.provide('supabase', supabase)
  app.config.globalProperties.$supabase = supabase
}