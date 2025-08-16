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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          id: string
          type: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          type: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          type?: string
          value?: string
        }
        Relationships: []
      }
      job_updates: {
        Row: {
          after_image: string | null
          before_image: string | null
          id: string
          notes: string | null
          request_id: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string | null
        }
        Insert: {
          after_image?: string | null
          before_image?: string | null
          id?: string
          notes?: string | null
          request_id: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at?: string | null
        }
        Update: {
          after_image?: string | null
          before_image?: string | null
          id?: string
          notes?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_updates_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "painting_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      painting_designs: {
        Row: {
          category: string
          created_at: string | null
          id: string
          image_url: string
          tags: string[] | null
          title: string
          vendor_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          image_url: string
          tags?: string[] | null
          title: string
          vendor_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          image_url?: string
          tags?: string[] | null
          title?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "painting_designs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      painting_requests: {
        Row: {
          created_at: string | null
          dimension_image: string | null
          dimensions: Json | null
          estimated_cost: number | null
          id: string
          room_types: Json
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          dimension_image?: string | null
          dimensions?: Json | null
          estimated_cost?: number | null
          id?: string
          room_types: Json
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          dimension_image?: string | null
          dimensions?: Json | null
          estimated_cost?: number | null
          id?: string
          room_types?: Json
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "painting_requests_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pricing: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          price_type: Database["public"]["Enums"]["pricing_type"]
          price_value: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          price_type: Database["public"]["Enums"]["pricing_type"]
          price_value: number
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          price_type?: Database["public"]["Enums"]["pricing_type"]
          price_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_name: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          name: string
          profile_image: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
          vendor_request_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          name: string
          profile_image?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
          vendor_request_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string
          profile_image?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
          vendor_request_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_vendor: {
        Args: { vendor_user_id: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_approved_vendor: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "vendor" | "admin"
      pricing_type: "per_sq_ft" | "per_room"
      request_status: "pending" | "accepted" | "in_progress" | "completed"
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
      app_role: ["user", "vendor", "admin"],
      pricing_type: ["per_sq_ft", "per_room"],
      request_status: ["pending", "accepted", "in_progress", "completed"],
    },
  },
} as const
