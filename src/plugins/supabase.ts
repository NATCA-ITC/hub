import { createClient } from '@supabase/supabase-js'
import type { App } from 'vue'

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
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Determine schema based on environment
const isDevelopment = import.meta.env.DEV
const schema = isDevelopment ? 'dev' : 'public'

// Create Supabase client
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
})

// Create a wrapper that automatically applies correct schema using .schema() method
export const supabase = new Proxy(supabaseClient, {
  get(target: any, prop: string) {
    if (prop === 'from') {
      return (table: string) => {
        // Shared tables managed by Platform - use environment-specific schema
        if (['members', 'facilities', 'regions', 'positions', 'proxy_routes', 'sync_metadata'].includes(table)) {
          console.log(`🔍 Querying ${schema}.${table}`)
          return target.schema(schema).from(table)
        }
        // Default - public schema for Hub-specific tables
        return target.from(table)
      }
    }
    return target[prop]
  }
})

export default function (app: App) {
  app.provide('supabase', supabase)
  app.config.globalProperties.$supabase = supabase
}