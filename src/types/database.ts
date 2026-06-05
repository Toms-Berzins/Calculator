// Auto-generated from Supabase schema.
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'
export type JobStatus = 'open' | 'won' | 'lost' | 'archived'
export type MaterialType = 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'ASA' | 'Nylon' | 'Other'

export interface Database {
  public: {
    Tables: {
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
      materials: {
        Row: {
          id: string
          user_id: string
          name: string
          material_type: MaterialType
          brand: string | null
          color: string | null
          price_per_kg: number
          stock_grams: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          material_type: MaterialType
          brand?: string | null
          color?: string | null
          price_per_kg?: number
          stock_grams?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          material_type?: MaterialType
          brand?: string | null
          color?: string | null
          price_per_kg?: number
          stock_grams?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bulk_discount_tiers: {
        Row: {
          id: number
          min_qty: number
          max_qty: number | null
          discount_percent: number
          label: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          min_qty: number
          max_qty?: number | null
          discount_percent?: number
          label?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          min_qty?: number
          max_qty?: number | null
          discount_percent?: number
          label?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      job_status: JobStatus
      quote_status: QuoteStatus
      material_type: MaterialType
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
export type Material = Database['public']['Tables']['materials']['Row']

// Quote with nested relations
export type QuoteWithRelations = Quote & {
  quote_items: QuoteItem[]
  jobs: (Job & { customers: Customer | null }) | null
}

export type BulkDiscountTier = Database['public']['Tables']['bulk_discount_tiers']['Row']
