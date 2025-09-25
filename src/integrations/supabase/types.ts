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
    PostgrestVersion: "13.0.4"
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
            foreignKeyName: "company_profiles_partner_membership_id_fkey"
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
          applies_to: string
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
          applies_to?: string
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
          applies_to?: string
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
      membership_pricing: {
        Row: {
          created_at: string
          employees_range: string
          id: string
          membership_type: string
          price: number
          updated_at: string
          yearly_price_display: string
        }
        Insert: {
          created_at?: string
          employees_range: string
          id?: string
          membership_type: string
          price: number
          updated_at?: string
          yearly_price_display: string
        }
        Update: {
          created_at?: string
          employees_range?: string
          id?: string
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
          boundary_behavior: string | null
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
          membership_type: Database["public"]["Enums"]["membership_type"] | null
          mollie_payment_id: string | null
          motivation: string | null
          newsletter: boolean | null
          payment_status: string | null
          phone: string
          respectful_practices: string | null
          respectful_workplace: string | null
          specializations: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          boundary_behavior?: string | null
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
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          mollie_payment_id?: string | null
          motivation?: string | null
          newsletter?: boolean | null
          payment_status?: string | null
          phone: string
          respectful_practices?: string | null
          respectful_workplace?: string | null
          specializations: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          boundary_behavior?: string | null
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
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          mollie_payment_id?: string | null
          motivation?: string | null
          newsletter?: boolean | null
          payment_status?: string | null
          phone?: string
          respectful_practices?: string | null
          respectful_workplace?: string | null
          specializations?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_house_number: string | null
          address_postcode: string | null
          address_street: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          discount_code: string | null
          email: string | null
          id: string
          items: Json
          mollie_payment_id: string | null
          payment_status: string
          shipping: number
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_house_number?: string | null
          address_postcode?: string | null
          address_street?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          email?: string | null
          id?: string
          items?: Json
          mollie_payment_id?: string | null
          payment_status?: string
          shipping?: number
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_house_number?: string | null
          address_postcode?: string | null
          address_street?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          email?: string | null
          id?: string
          items?: Json
          mollie_payment_id?: string | null
          payment_status?: string
          shipping?: number
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      partner_memberships: {
        Row: {
          amount: number | null
          company_name: string
          created_at: string
          currency: string | null
          description: string | null
          email: string
          first_name: string
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
          amount?: number | null
          company_name: string
          created_at?: string
          currency?: string | null
          description?: string | null
          email: string
          first_name: string
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
          amount?: number | null
          company_name?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string
          first_name?: string
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
          email: string
          id: string
          is_admin: boolean | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_admin?: boolean | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          alt_text: string
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          is_featured: boolean | null
          location: string | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          alt_text: string
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          location?: string | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          alt_text?: string
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          location?: string | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          content: string
          created_at: string
          error_correction: string
          id: string
          qr_size: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          error_correction?: string
          id?: string
          qr_size?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          error_correction?: string
          id?: string
          qr_size?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      website_content: {
        Row: {
          contact_email: string
          contact_phone: string
          created_at: string
          hero_subtitle: string
          hero_title: string
          id: string
          mission_text: string
          mission_title: string
          primary_color: string
          secondary_color: string
          updated_at: string
        }
        Insert: {
          contact_email: string
          contact_phone: string
          created_at?: string
          hero_subtitle: string
          hero_title: string
          id?: string
          mission_text: string
          mission_title: string
          primary_color: string
          secondary_color: string
          updated_at?: string
        }
        Update: {
          contact_email?: string
          contact_phone?: string
          created_at?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          mission_text?: string
          mission_title?: string
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      verify_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      membership_type: "klein" | "middelgroot" | "groot" | "offerte"
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
    Enums: {
      membership_type: ["klein", "middelgroot", "groot", "offerte"],
    },
  },
} as const
