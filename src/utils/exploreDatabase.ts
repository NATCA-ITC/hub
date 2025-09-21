// Database exploration utility to understand Supabase schema
import { supabase } from '@/plugins/supabase'

export interface TableInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
}

export interface ForeignKey {
  table_name: string
  column_name: string
  foreign_table_name: string
  foreign_column_name: string
}

export class DatabaseExplorer {
  // Get all tables - we'll try common table names since information_schema might not be accessible
  static async getTables(): Promise<string[]> {
    // Common table names we expect in the MyNATCA database
    const commonTables = [
      'members',
      'facilities',
      'regions',
      'positions',
      'member_types',
      'ai_conversations'
    ]

    const existingTables: string[] = []

    // Test each table to see if it exists
    for (const tableName of commonTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (!error) {
          existingTables.push(tableName)
        }
      } catch (err) {
        // Table doesn't exist or no access
        console.warn(`Table ${tableName} not accessible`)
      }
    }

    return existingTables
  }

  // Get structure by examining sample data
  static async getTableColumns(tableName: string): Promise<TableInfo[]> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        const sampleRow = data[0]
        return Object.keys(sampleRow).map(key => ({
          table_name: tableName,
          column_name: key,
          data_type: typeof sampleRow[key],
          is_nullable: sampleRow[key] === null ? 'YES' : 'NO'
        }))
      }

      return []
    } catch (error) {
      console.error(`Error fetching columns for ${tableName}:`, error)
      return []
    }
  }

  // Sample data from a table (limit 5 rows)
  static async sampleTableData(tableName: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error(`Error sampling data from ${tableName}:`, error)
      return []
    }
  }

  // Get member with region and facility information (with joins)
  static async getMemberWithDetails(memberNumber?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('members')
        .select(`
          member_number,
          first_name,
          last_name,
          member_type_id,
          facility_code,
          region_code,
          email,
          created_at,
          updated_at
        `)

      if (memberNumber) {
        query = query.eq('member_number', memberNumber)
      } else {
        query = query.limit(5) // Sample data
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching member details:', error)
      return []
    }
  }

  // Explore the complete database structure
  static async exploreFullStructure(): Promise<{
    tables: string[]
    tableDetails: Record<string, TableInfo[]>
    sampleData: Record<string, any[]>
  }> {
    const tables = await this.getTables()
    const tableDetails: Record<string, TableInfo[]> = {}
    const sampleData: Record<string, any[]> = {}

    // Get details for key tables
    const keyTables = tables.filter(table =>
      ['members', 'facilities', 'regions', 'positions', 'member_types'].includes(table)
    )

    for (const table of keyTables) {
      tableDetails[table] = await this.getTableColumns(table)
      sampleData[table] = await this.sampleTableData(table)
    }

    return {
      tables,
      tableDetails,
      sampleData
    }
  }
}