export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alert_events: {
        Row: {
          acknowledged: boolean
          created_at: string
          dedupe_key: string | null
          device_id: string
          hive_label: string
          id: string
          message: string
          metric: string
          rule_id: string | null
          snapshot_date: string | null
          value: number | null
        }
        Insert: {
          acknowledged?: boolean
          created_at?: string
          dedupe_key?: string | null
          device_id: string
          hive_label: string
          id?: string
          message: string
          metric: string
          rule_id?: string | null
          snapshot_date?: string | null
          value?: number | null
        }
        Update: {
          acknowledged?: boolean
          created_at?: string
          dedupe_key?: string | null
          device_id?: string
          hive_label?: string
          id?: string
          message?: string
          metric?: string
          rule_id?: string | null
          snapshot_date?: string | null
          value?: number | null
        }
        Relationships: []
      }
      alert_rules: {
        Row: {
          comparator: string
          created_at: string
          device_id: string
          enabled: boolean
          hive_label: string
          id: string
          metric: string
          threshold: number
          window_hours: number
        }
        Insert: {
          comparator?: string
          created_at?: string
          device_id: string
          enabled?: boolean
          hive_label?: string
          id?: string
          metric: string
          threshold: number
          window_hours?: number
        }
        Update: {
          comparator?: string
          created_at?: string
          device_id?: string
          enabled?: boolean
          hive_label?: string
          id?: string
          metric?: string
          threshold?: number
          window_hours?: number
        }
        Relationships: []
      }
      bee_diseases: {
        Row: {
          affected_castes: string | null
          created_at: string
          device_id: string
          id: string
          is_default: boolean
          name: string
          notes: string | null
          pathogen: string
          prevention: string | null
          severity: string
          symptoms: string[]
          treatments: string[]
          type: string
          updated_at: string
        }
        Insert: {
          affected_castes?: string | null
          created_at?: string
          device_id?: string
          id?: string
          is_default?: boolean
          name: string
          notes?: string | null
          pathogen: string
          prevention?: string | null
          severity?: string
          symptoms?: string[]
          treatments?: string[]
          type?: string
          updated_at?: string
        }
        Update: {
          affected_castes?: string | null
          created_at?: string
          device_id?: string
          id?: string
          is_default?: boolean
          name?: string
          notes?: string | null
          pathogen?: string
          prevention?: string | null
          severity?: string
          symptoms?: string[]
          treatments?: string[]
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      bee_flight_logs: {
        Row: {
          ai_insights: string | null
          bees_per_minute: number
          created_at: string
          device_id: string
          flight_distance_m: number | null
          florage_source: string | null
          hive_label: string
          id: string
          notes: string | null
          observed_at: string
          pollen_loads: number
          run_id: string | null
          weather: string | null
        }
        Insert: {
          ai_insights?: string | null
          bees_per_minute?: number
          created_at?: string
          device_id: string
          flight_distance_m?: number | null
          florage_source?: string | null
          hive_label?: string
          id?: string
          notes?: string | null
          observed_at?: string
          pollen_loads?: number
          run_id?: string | null
          weather?: string | null
        }
        Update: {
          ai_insights?: string | null
          bees_per_minute?: number
          created_at?: string
          device_id?: string
          flight_distance_m?: number | null
          florage_source?: string | null
          hive_label?: string
          id?: string
          notes?: string | null
          observed_at?: string
          pollen_loads?: number
          run_id?: string | null
          weather?: string | null
        }
        Relationships: []
      }
      bee_species: {
        Row: {
          category: string
          created_at: string
          description: string | null
          device_id: string
          habitat: string | null
          id: string
          image_url: string | null
          is_default: boolean
          name: string
          notes: string | null
          scientific: string
          traits: string[]
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          device_id?: string
          habitat?: string | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          name: string
          notes?: string | null
          scientific: string
          traits?: string[]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          device_id?: string
          habitat?: string | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          name?: string
          notes?: string | null
          scientific?: string
          traits?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      bloom_observations: {
        Row: {
          ai_insights: string | null
          anchor_lat: number | null
          anchor_lng: number | null
          bloom_end: string | null
          bloom_start: string | null
          created_at: string
          crop: string
          device_id: string
          id: string
          intensity: number
          notes: string | null
          observed_on: string
          peak_bloom: string | null
          region: string
          run_id: string | null
          version_id: string | null
          zone_label: string | null
        }
        Insert: {
          ai_insights?: string | null
          anchor_lat?: number | null
          anchor_lng?: number | null
          bloom_end?: string | null
          bloom_start?: string | null
          created_at?: string
          crop: string
          device_id: string
          id?: string
          intensity?: number
          notes?: string | null
          observed_on?: string
          peak_bloom?: string | null
          region: string
          run_id?: string | null
          version_id?: string | null
          zone_label?: string | null
        }
        Update: {
          ai_insights?: string | null
          anchor_lat?: number | null
          anchor_lng?: number | null
          bloom_end?: string | null
          bloom_start?: string | null
          created_at?: string
          crop?: string
          device_id?: string
          id?: string
          intensity?: number
          notes?: string | null
          observed_on?: string
          peak_bloom?: string | null
          region?: string
          run_id?: string | null
          version_id?: string | null
          zone_label?: string | null
        }
        Relationships: []
      }
      calculator_runs: {
        Row: {
          calculator_key: string
          created_at: string
          device_id: string
          id: string
          inputs: Json
          label: string | null
          notes: string | null
          outputs: Json
        }
        Insert: {
          calculator_key: string
          created_at?: string
          device_id: string
          id?: string
          inputs?: Json
          label?: string | null
          notes?: string | null
          outputs?: Json
        }
        Update: {
          calculator_key?: string
          created_at?: string
          device_id?: string
          id?: string
          inputs?: Json
          label?: string | null
          notes?: string | null
          outputs?: Json
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          device_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      florage_plants: {
        Row: {
          bloom: string
          created_at: string
          device_id: string
          id: string
          is_default: boolean
          latin: string
          name: string
          nectar: number
          notes: string | null
          pollen: number
          radius: number
          updated_at: string
        }
        Insert: {
          bloom: string
          created_at?: string
          device_id: string
          id?: string
          is_default?: boolean
          latin: string
          name: string
          nectar?: number
          notes?: string | null
          pollen?: number
          radius?: number
          updated_at?: string
        }
        Update: {
          bloom?: string
          created_at?: string
          device_id?: string
          id?: string
          is_default?: boolean
          latin?: string
          name?: string
          nectar?: number
          notes?: string | null
          pollen?: number
          radius?: number
          updated_at?: string
        }
        Relationships: []
      }
      forecast_snapshots: {
        Row: {
          band: string | null
          created_at: string
          device_id: string
          forecast_for_date: string
          hive_label: string
          id: string
          precip_mm: number | null
          predicted_bees_per_min: number | null
          temp_c: number | null
          wind_kmh: number | null
        }
        Insert: {
          band?: string | null
          created_at?: string
          device_id: string
          forecast_for_date: string
          hive_label?: string
          id?: string
          precip_mm?: number | null
          predicted_bees_per_min?: number | null
          temp_c?: number | null
          wind_kmh?: number | null
        }
        Update: {
          band?: string | null
          created_at?: string
          device_id?: string
          forecast_for_date?: string
          hive_label?: string
          id?: string
          precip_mm?: number | null
          predicted_bees_per_min?: number | null
          temp_c?: number | null
          wind_kmh?: number | null
        }
        Relationships: []
      }
      harvest_run_comments: {
        Row: {
          anchor_lat: number | null
          anchor_lng: number | null
          anchor_step: number | null
          anchor_type: string
          author_name: string
          body: string
          created_at: string
          id: string
          parent_id: string | null
          run_id: string
        }
        Insert: {
          anchor_lat?: number | null
          anchor_lng?: number | null
          anchor_step?: number | null
          anchor_type?: string
          author_name?: string
          body: string
          created_at?: string
          id?: string
          parent_id?: string | null
          run_id: string
        }
        Update: {
          anchor_lat?: number | null
          anchor_lng?: number | null
          anchor_step?: number | null
          anchor_type?: string
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvest_run_comments_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "harvest_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      harvest_run_versions: {
        Row: {
          ai_forecast: string | null
          assumptions: Json | null
          created_at: string
          id: string
          local_estimate_kg: number | null
          moa_filters: Json | null
          prompt_variant: string
          run_id: string
          site_layout: Json | null
          version_label: string
        }
        Insert: {
          ai_forecast?: string | null
          assumptions?: Json | null
          created_at?: string
          id?: string
          local_estimate_kg?: number | null
          moa_filters?: Json | null
          prompt_variant?: string
          run_id: string
          site_layout?: Json | null
          version_label?: string
        }
        Update: {
          ai_forecast?: string | null
          assumptions?: Json | null
          created_at?: string
          id?: string
          local_estimate_kg?: number | null
          moa_filters?: Json | null
          prompt_variant?: string
          run_id?: string
          site_layout?: Json | null
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvest_run_versions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "harvest_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      harvest_runs: {
        Row: {
          acres: number
          ai_forecast: string | null
          assumptions: Json | null
          created_at: string
          crop: string
          device_id: string
          fill_pct: number
          frame_type: string
          hhi: number
          hives: number
          id: string
          local_estimate_kg: number | null
          moa_filters: Json | null
          notes: string | null
          prompt_variant: string
          region: string
          site_layout: Json | null
        }
        Insert: {
          acres: number
          ai_forecast?: string | null
          assumptions?: Json | null
          created_at?: string
          crop: string
          device_id: string
          fill_pct: number
          frame_type: string
          hhi: number
          hives: number
          id?: string
          local_estimate_kg?: number | null
          moa_filters?: Json | null
          notes?: string | null
          prompt_variant?: string
          region: string
          site_layout?: Json | null
        }
        Update: {
          acres?: number
          ai_forecast?: string | null
          assumptions?: Json | null
          created_at?: string
          crop?: string
          device_id?: string
          fill_pct?: number
          frame_type?: string
          hhi?: number
          hives?: number
          id?: string
          local_estimate_kg?: number | null
          moa_filters?: Json | null
          notes?: string | null
          prompt_variant?: string
          region?: string
          site_layout?: Json | null
        }
        Relationships: []
      }
      varroa_simulations: {
        Row: {
          created_at: string
          device_id: string
          id: string
          label: string
          mode: string
          notes: string | null
          params: Json
          results: Json
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          label?: string
          mode?: string
          notes?: string | null
          params?: Json
          results?: Json
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          label?: string
          mode?: string
          notes?: string | null
          params?: Json
          results?: Json
        }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
