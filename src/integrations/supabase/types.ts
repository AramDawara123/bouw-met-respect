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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      action_items_pricing: {
        Row: {
          created_at: string
          display_order: number | null
          employees_range: string
          id: string
          is_popular: boolean | null
          is_quote: boolean | null
          price_cents: number
          price_display: string
          size_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          employees_range: string
          id?: string
          is_popular?: boolean | null
          is_quote?: boolean | null
          price_cents: number
          price_display: string
          size_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          employees_range?: string
          id?: string
          is_popular?: boolean | null
          is_quote?: boolean | null
          price_cents?: number
          price_display?: string
          size_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          country: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          page_path: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          industry: string | null
          is_featured: boolean | null
          logo_url: string | null
          name: string
          partner_membership_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          partner_membership_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          partner_membership_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_partner_membership"
            columns: ["partner_membership_id"]
            isOneToOne: false
            referencedRelation: "partner_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          active: boolean | null
          applies_to: string | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          minimum_order_amount: number | null
          starts_at: string | null
          updated_at: string
          usage_limit: number | null
          used_count: number | null
        }
        Insert: {
          active?: boolean | null
          applies_to?: string | null
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          minimum_order_amount?: number | null
          starts_at?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
        }
        Update: {
          active?: boolean | null
          applies_to?: string | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          minimum_order_amount?: number | null
          starts_at?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          email: string
          id: string
          message: string | null
          mollie_payment_id: string | null
          name: string
          payment_status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          email: string
          id?: string
          message?: string | null
          mollie_payment_id?: string | null
          name: string
          payment_status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          email?: string
          id?: string
          message?: string | null
          mollie_payment_id?: string | null
          name?: string
          payment_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      membership_pricing: {
        Row: {
          created_at: string
          display_order: number | null
          employees_range: string
          id: string
          is_quote: boolean | null
          membership_type: string
          price: number
          updated_at: string
          yearly_price_display: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          employees_range: string
          id?: string
          is_quote?: boolean | null
          membership_type: string
          price: number
          updated_at?: string
          yearly_price_display: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          employees_range?: string
          id?: string
          is_quote?: boolean | null
          membership_type?: string
          price?: number
          updated_at?: string
          yearly_price_display?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          amount: number | null
          company: string | null
          created_at: string
          currency: string | null
          email: string
          experience_years: string
          first_name: string
          id: string
          industry_role: string
          job_title: string
          last_name: string
          membership_type: string | null
          mollie_payment_id: string | null
          newsletter: boolean | null
          payment_status: string | null
          phone: string
          specializations: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          company?: string | null
          created_at?: string
          currency?: string | null
          email: string
          experience_years: string
          first_name: string
          id?: string
          industry_role: string
          job_title: string
          last_name: string
          membership_type?: string | null
          mollie_payment_id?: string | null
          newsletter?: boolean | null
          payment_status?: string | null
          phone: string
          specializations: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          company?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          experience_years?: string
          first_name?: string
          id?: string
          industry_role?: string
          job_title?: string
          last_name?: string
          membership_type?: string | null
          mollie_payment_id?: string | null
          newsletter?: boolean | null
          payment_status?: string | null
          phone?: string
          specializations?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          currency: string | null
          customer_address: string | null
          customer_city: string | null
          customer_email: string
          customer_first_name: string | null
          customer_last_name: string | null
          customer_name: string
          customer_phone: string | null
          customer_postal_code: string | null
          discount_amount: number | null
          discount_code: string | null
          id: string
          items: Json
          mollie_payment_id: string | null
          payment_status: string | null
          shipping: number | null
          subtotal: number | null
          total: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_email: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_postal_code?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          id?: string
          items: Json
          mollie_payment_id?: string | null
          payment_status?: string | null
          shipping?: number | null
          subtotal?: number | null
          total?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_postal_code?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          id?: string
          items?: Json
          mollie_payment_id?: string | null
          payment_status?: string | null
          shipping?: number | null
          subtotal?: number | null
          total?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      partner_memberships: {
        Row: {
          account_created: boolean | null
          amount: number | null
          company_name: string
          company_size: string | null
          created_at: string
          currency: string | null
          description: string | null
          email: string
          first_name: string
          generated_password: string | null
          id: string
          industry: string | null
          last_name: string
          logo_url: string | null
          mollie_payment_id: string | null
          payment_status: string | null
          phone: string
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          account_created?: boolean | null
          amount?: number | null
          company_name: string
          company_size?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          email: string
          first_name: string
          generated_password?: string | null
          id?: string
          industry?: string | null
          last_name: string
          logo_url?: string | null
          mollie_payment_id?: string | null
          payment_status?: string | null
          phone: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          account_created?: boolean | null
          amount?: number | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string
          first_name?: string
          generated_password?: string | null
          id?: string
          industry?: string | null
          last_name?: string
          logo_url?: string | null
          mollie_payment_id?: string | null
          payment_status?: string | null
          phone?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      partner_pricing_tiers: {
        Row: {
          created_at: string
          display_order: number | null
          employee_range: string
          id: string
          is_active: boolean | null
          is_quote: boolean | null
          price_cents: number
          price_display: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          employee_range: string
          id?: string
          is_active?: boolean | null
          is_quote?: boolean | null
          price_cents: number
          price_display: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          employee_range?: string
          id?: string
          is_active?: boolean | null
          is_quote?: boolean | null
          price_cents?: number
          price_display?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          discount_active: boolean | null
          discount_fixed: number | null
          discount_percentage: number | null
          features: string[] | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount_active?: boolean | null
          discount_fixed?: number | null
          discount_percentage?: number | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount_active?: boolean | null
          discount_fixed?: number | null
          discount_percentage?: number | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          background_color: string | null
          content: string
          created_at: string
          error_correction: string | null
          foreground_color: string | null
          id: string
          qr_size: number | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          background_color?: string | null
          content: string
          created_at?: string
          error_correction?: string | null
          foreground_color?: string | null
          id?: string
          qr_size?: number | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          background_color?: string | null
          content?: string
          created_at?: string
          error_correction?: string | null
          foreground_color?: string | null
          id?: string
          qr_size?: number | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      verify_admin_access: { Args: never; Returns: boolean }
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
