export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      incidents: {
        Row: {
          id: string
          incident_type: string
          description: string | null
          source: string | null
          latitude: number
          longitude: number
          classification_confidence: number | null
          severity: string
          priority_level: number | null
          status: string
          is_consolidated: boolean | null
          report_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          incident_type: string
          description?: string | null
          source?: string | null
          latitude: number
          longitude: number
          classification_confidence?: number | null
          severity: string
          priority_level?: number | null
          status?: string
          is_consolidated?: boolean | null
          report_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['incidents']['Insert']>
        Relationships: []
      }
      resources: {
        Row: {
          id: string
          type: string
          name: string
          status: string
          capacity: number | null
          capabilities: string[] | null
          current_location: unknown | null // geometry or string
          home_base_location: unknown | null
          assigned_profile_id: string | null
          organization: string | null
          contact_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          name: string
          status?: string
          capacity?: number | null
          capabilities?: string[] | null
          current_location?: unknown | null
          home_base_location?: unknown | null
          assigned_profile_id?: string | null
          organization?: string | null
          contact_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['resources']['Insert']>
        Relationships: []
      }
      alerts: {
        Row: {
          id: string
          incident_id: string
          alert_type: string
          message: string
          status: string
          triggered_at: string
          acknowledged_by: string | null
          acknowledged_at: string | null
          resolved_at: string | null
        }
        Insert: {
          id?: string
          incident_id: string
          alert_type: string
          message: string
          status?: string
          triggered_at?: string
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          resolved_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
