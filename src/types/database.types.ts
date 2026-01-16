export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          id: string
          created_at: string
          first_name: string | null
          last_name: string | null
          name: string | null
          email: string
          phone: string | null
          city: string | null
          state: string | null
          country: string | null
          inquiry_type: string | null
          topic: string | null
          subject: string | null
          message: string | null
          company: string | null
          farm_name: string | null
          crop_type: string | null
          acres: number | null
          apiary_name: string | null
          hive_count: number | null
          experience_years: string | null
          form_specific_data: Record<string, unknown> | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          name?: string | null
          email: string
          phone?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          inquiry_type?: string | null
          topic?: string | null
          subject?: string | null
          message?: string | null
          company?: string | null
          farm_name?: string | null
          crop_type?: string | null
          acres?: number | null
          apiary_name?: string | null
          hive_count?: number | null
          experience_years?: string | null
          form_specific_data?: Record<string, unknown> | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          name?: string | null
          email?: string
          phone?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          inquiry_type?: string | null
          topic?: string | null
          subject?: string | null
          message?: string | null
          company?: string | null
          farm_name?: string | null
          crop_type?: string | null
          acres?: number | null
          apiary_name?: string | null
          hive_count?: number | null
          experience_years?: string | null
          form_specific_data?: Record<string, unknown> | null
          status?: string
        }
        Relationships: []
      }
      pollination_requests: {
        Row: {
          id: string
          created_at: string
          full_name: string
          email: string
          phone: string
          farm_name: string
          farm_location: string
          crop_type: string
          acres: number
          preferred_start_date: string
          additional_info: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          full_name: string
          email: string
          phone: string
          farm_name: string
          farm_location: string
          crop_type: string
          acres: number
          preferred_start_date: string
          additional_info?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string
          email?: string
          phone?: string
          farm_name?: string
          farm_location?: string
          crop_type?: string
          acres?: number
          preferred_start_date?: string
          additional_info?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          created_at: string
          email: string
          first_name: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          first_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          first_name?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          id: number
          created_at: string
          title: string
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          created_at: string
          customer_email: string
          customer_phone: string
          shipping_address: Json
          payment_method: string
          total_kes: number
          status: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_email: string
          customer_phone: string
          shipping_address: Json
          payment_method: string
          total_kes: number
          status?: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_email?: string
          customer_phone?: string
          shipping_address?: Json
          payment_method?: string
          total_kes?: number
          status?: string
          notes?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          category: string
          images: string[] | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          category: string
          images?: string[] | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          category?: string
          images?: string[] | null
          is_active?: boolean
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          price_kes: number
          stock_quantity: number
          is_available: boolean
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          price_kes: number
          stock_quantity: number
          is_available?: boolean
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          price_kes?: number
          stock_quantity?: number
          is_available?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      honey_batches: {
        Row: {
          id: string
          created_at: string
          batch_code: string
          honey_type: string
          harvest_date: string
          packaged_date: string | null
          quantity_kg: number
          processing_method: string
          block_hash: string | null
          // Farmer/Beekeeper Info
          farmer_name: string | null
          farmer_phone: string | null
          beekeeper_name: string | null
          beekeeper_id: string | null
          // Location Info
          apiary_name: string | null
          location_county: string | null
          location_region: string | null
          latitude: number | null
          longitude: number | null
          // Quality & Certifications
          quality_grade: string | null
          certifications: string[] | null
          moisture_content: number | null
          color_grade: string | null
          // Status
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          batch_code: string
          honey_type: string
          harvest_date: string
          packaged_date?: string | null
          quantity_kg: number
          processing_method: string
          block_hash?: string | null
          farmer_name?: string | null
          farmer_phone?: string | null
          beekeeper_name?: string | null
          beekeeper_id?: string | null
          apiary_name?: string | null
          location_county?: string | null
          location_region?: string | null
          latitude?: number | null
          longitude?: number | null
          quality_grade?: string | null
          certifications?: string[] | null
          moisture_content?: number | null
          color_grade?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          batch_code?: string
          honey_type?: string
          harvest_date?: string
          packaged_date?: string | null
          quantity_kg?: number
          processing_method?: string
          block_hash?: string | null
          farmer_name?: string | null
          farmer_phone?: string | null
          beekeeper_name?: string | null
          beekeeper_id?: string | null
          apiary_name?: string | null
          location_county?: string | null
          location_region?: string | null
          latitude?: number | null
          longitude?: number | null
          quality_grade?: string | null
          certifications?: string[] | null
          moisture_content?: number | null
          color_grade?: string | null
          status?: string
        }
        Relationships: []
      },
      iot_devices: {
        Row: {
          id: string
          created_at: string
          device_code: string
          device_name: string
          device_type: "infield" | "inland" | "disease"
          location_name: string | null
          latitude: number | null
          longitude: number | null
          farmer_id: string | null
          apiary_id: string | null
          hive_id: string | null
          last_ping: string | null
          battery_level: number | null
          firmware_version: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          device_code: string
          device_name: string
          device_type: "infield" | "inland" | "disease"
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          farmer_id?: string | null
          apiary_id?: string | null
          hive_id?: string | null
          last_ping?: string | null
          battery_level?: number | null
          firmware_version?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          device_code?: string
          device_name?: string
          device_type?: "infield" | "inland" | "disease"
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          farmer_id?: string | null
          apiary_id?: string | null
          hive_id?: string | null
          last_ping?: string | null
          battery_level?: number | null
          firmware_version?: string | null
          status?: string
        }
        Relationships: []
      },
      sensor_readings: {
        Row: {
          id: string
          created_at: string
          device_id: string
          sensor_type: "infield" | "inland" | "disease"
          timestamp: string
          latitude: number | null
          longitude: number | null
          readings: Json
          battery_level: number | null
          signal_strength: number | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          device_id: string
          sensor_type: "infield" | "inland" | "disease"
          timestamp: string
          latitude?: number | null
          longitude?: number | null
          readings: Json
          battery_level?: number | null
          signal_strength?: number | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          device_id?: string
          sensor_type?: "infield" | "inland" | "disease"
          timestamp?: string
          latitude?: number | null
          longitude?: number | null
          readings?: Json
          battery_level?: number | null
          signal_strength?: number | null
          status?: string
        }
        Relationships: []
      },
      client_hives: {
        Row: {
          id: string
          created_at: string
          user_id: string
          hive_name: string
          hive_code: string | null
          crop_type: string | null
          farm_location: string | null
          latitude: number | null
          longitude: number | null
          contract_start: string | null
          contract_end: string | null
          status: "active" | "inactive" | "pending"
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          hive_name: string
          hive_code?: string | null
          crop_type?: string | null
          farm_location?: string | null
          latitude?: number | null
          longitude?: number | null
          contract_start?: string | null
          contract_end?: string | null
          status?: "active" | "inactive" | "pending"
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          hive_name?: string
          hive_code?: string | null
          crop_type?: string | null
          farm_location?: string | null
          latitude?: number | null
          longitude?: number | null
          contract_start?: string | null
          contract_end?: string | null
          status?: "active" | "inactive" | "pending"
        }
        Relationships: []
      },
      stock_movements: {
        Row: {
          id: string
          created_at: string
          product_id: string | null
          type: "addition" | "removal" | "adjustment"
          quantity: number
          reason: string | null
          performed_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          product_id?: string | null
          type: "addition" | "removal" | "adjustment"
          quantity: number
          reason?: string | null
          performed_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          product_id?: string | null
          type?: "addition" | "removal" | "adjustment"
          quantity?: number
          reason?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      },
      farmers: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string | null
          email: string | null
          id_number: string | null
          experience_years: number | null
          story: string | null
          latitude: number | null
          longitude: number | null
          location_name: string | null
          region: string | null
          county: string | null
          ward: string | null
          certification_status: string | null
          farmer_id: string | null
          status: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone?: string | null
          email?: string | null
          id_number?: string | null
          experience_years?: number | null
          story?: string | null
          latitude?: number | null
          longitude?: number | null
          location_name?: string | null
          region?: string | null
          county?: string | null
          ward?: string | null
          certification_status?: string | null
          farmer_id?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string | null
          email?: string | null
          id_number?: string | null
          experience_years?: number | null
          story?: string | null
          latitude?: number | null
          longitude?: number | null
          location_name?: string | null
          region?: string | null
          county?: string | null
          ward?: string | null
          certification_status?: string | null
          farmer_id?: string | null
          status?: string | null
        }
        Relationships: []
      },
      apiaries: {
        Row: {
          id: string
          created_at: string
          name: string
          location_name: string | null
          county: string | null
          region: string | null
          latitude: number | null
          longitude: number | null
          farmer_id: string | null
          status: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          location_name?: string | null
          county?: string | null
          region?: string | null
          latitude?: number | null
          longitude?: number | null
          farmer_id?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          location_name?: string | null
          county?: string | null
          region?: string | null
          latitude?: number | null
          longitude?: number | null
          farmer_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apiaries_farmer_id_fkey"
            columns: ["farmer_id"]
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          }
        ]
      },
      hives: {
        Row: {
          id: string
          created_at: string
          hive_code: string
          apiary_id: string | null
          type: string | null
          installation_date: string | null
          last_inspection_date: string | null
          status: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          hive_code: string
          apiary_id?: string | null
          type?: string | null
          installation_date?: string | null
          last_inspection_date?: string | null
          status?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          hive_code?: string
          apiary_id?: string | null
          type?: string | null
          installation_date?: string | null
          last_inspection_date?: string | null
          status?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hives_apiary_id_fkey"
            columns: ["apiary_id"]
            referencedRelation: "apiaries"
            referencedColumns: ["id"]
          }
        ]
      },
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          website: string | null
          email: string | null
          role: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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