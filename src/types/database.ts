// Auto-generated from Supabase schema.
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'
export type JobStatus = 'open' | 'won' | 'lost' | 'archived'

export interface Database {
  public: {
    Tables: {
      materials: {
        Row: {
          id: string
          name: string
          type: string | null
          color: string | null
          unit: string
          reorder_point: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          color?: string | null
          unit?: string
          reorder_point?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          color?: string | null
          unit?: string
          reorder_point?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_stock_movements: {
        Row: {
          id: string
          material_id: string
          qty: number
          movement_type: 'add' | 'remove'
          reason: string | null
          job_id: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          material_id: string
          qty: number
          movement_type: 'add' | 'remove'
          reason?: string | null
          job_id?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          material_id?: string
          qty?: number
          movement_type?: 'add' | 'remove'
          reason?: string | null
          job_id?: string | null
          user_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'material_stock_movements_material_id_fkey',
            columns: ['material_id'],
            isOneToOne: false,
            referencedRelation: 'materials',
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'material_stock_movements_job_id_fkey',
            columns: ['job_id'],
            isOneToOne: false,
            referencedRelation: 'jobs',
            referencedColumns: ['id']
          }
        ]
      }
      customers: {
        Row: {
          id: string
          name: string
          company: string | null
          email: string | null
          phone: string | null
          address: string | null
          vat_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          vat_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          vat_number?: string | null
          created_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string | null
          customer_id: string
          status: JobStatus
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          customer_id: string
          status?: JobStatus
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          customer_id?: string
          status?: JobStatus
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'jobs_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
        ]
      }
      calculator_settings: {
        Row: {
          id: string
          user_id: string
          material_price_per_kg: number
          machine_rate_per_hour: number
          labor_rate_per_hour: number
          power_consumption_kw: number
          electricity_rate_per_kwh: number
          failure_rate_percent: number
          margin_percent: number
          material_overhead_percent: number
          packaging_cost: number
          shipping_cost: number
          company_name: string | null
          company_address: string | null
          company_vat_number: string | null
          company_email: string | null
          company_phone: string | null
          company_website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          material_price_per_kg?: number
          machine_rate_per_hour?: number
          labor_rate_per_hour?: number
          power_consumption_kw?: number
          electricity_rate_per_kwh?: number
          failure_rate_percent?: number
          margin_percent?: number
          material_overhead_percent?: number
          packaging_cost?: number
          shipping_cost?: number
          company_name?: string | null
          company_address?: string | null
          company_vat_number?: string | null
          company_email?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          material_price_per_kg?: number
          machine_rate_per_hour?: number
          labor_rate_per_hour?: number
          power_consumption_kw?: number
          electricity_rate_per_kwh?: number
          failure_rate_percent?: number
          margin_percent?: number
          material_overhead_percent?: number
          packaging_cost?: number
          shipping_cost?: number
          company_name?: string | null
          company_address?: string | null
          company_vat_number?: string | null
          company_email?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          id: string
          job_id: string
          created_by: string
          status: QuoteStatus
          subtotal: number
          tax_rate: number
          total: number
          notes: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          created_by: string
          status?: QuoteStatus
          subtotal?: number
          tax_rate?: number
          total?: number
          notes?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          created_by?: string
          status?: QuoteStatus
          subtotal?: number
          tax_rate?: number
          total?: number
          notes?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'quotes_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
        ]
      }
      quote_items: {
        Row: {
          id: string
          quote_id: string
          description: string
          quantity: number
          unit_price: number
          subtotal: number
          sort_order: number
        }
        Insert: {
          id?: string
          quote_id: string
          description: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          sort_order?: number
        }
        Update: {
          id?: string
          quote_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'quote_items_quote_id_fkey'
            columns: ['quote_id']
            isOneToOne: false
            referencedRelation: 'quotes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      job_status: JobStatus
      quote_status: QuoteStatus
    }
    CompositeTypes: Record<string, never>
  }
}

// Convenience row types
export type Customer = Database['public']['Tables']['customers']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type CalculatorSettings = Database['public']['Tables']['calculator_settings']['Row']
export type Quote = Database['public']['Tables']['quotes']['Row']
export type QuoteItem = Database['public']['Tables']['quote_items']['Row']

// Quote with nested relations
export type QuoteWithRelations = Quote & {
  quote_items: QuoteItem[]
  jobs: (Job & { customers: Customer | null }) | null
}
