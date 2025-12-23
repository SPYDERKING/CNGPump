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
      bookings: {
        Row: {
          amount: number
          booking_status: string
          confirmation_status: string | null
          created_at: string
          fuel_quantity: number
          id: string
          payment_status: string
          pump_id: string
          slot_date: string
          slot_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_status?: string
          confirmation_status?: string | null
          created_at?: string
          fuel_quantity?: number
          id?: string
          payment_status?: string
          pump_id: string
          slot_date: string
          slot_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_status?: string
          confirmation_status?: string | null
          created_at?: string
          fuel_quantity?: number
          id?: string
          payment_status?: string
          pump_id?: string
          slot_date?: string
          slot_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_pump_id_fkey"
            columns: ["pump_id"]
            isOneToOne: false
            referencedRelation: "pumps"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          vehicle_number: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          vehicle_number?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          vehicle_number?: string | null
        }
        Relationships: []
      }
      pump_admins: {
        Row: {
          created_at: string
          id: string
          pump_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pump_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pump_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pump_admins_pump_id_fkey"
            columns: ["pump_id"]
            isOneToOne: false
            referencedRelation: "pumps"
            referencedColumns: ["id"]
          },
        ]
      }
      pumps: {
        Row: {
          address: string
          booked_lanes: number
          city: string
          created_at: string
          id: string
          is_open: boolean
          latitude: number | null
          longitude: number | null
          name: string
          rating: number | null
          remaining_capacity: number
          total_capacity: number
          updated_at: string
          walkin_lanes: number
        }
        Insert: {
          address: string
          booked_lanes?: number
          city: string
          created_at?: string
          id?: string
          is_open?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          rating?: number | null
          remaining_capacity?: number
          total_capacity?: number
          updated_at?: string
          walkin_lanes?: number
        }
        Update: {
          address?: string
          booked_lanes?: number
          city?: string
          created_at?: string
          id?: string
          is_open?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          rating?: number | null
          remaining_capacity?: number
          total_capacity?: number
          updated_at?: string
          walkin_lanes?: number
        }
        Relationships: []
      }
      token_scans: {
        Row: {
          created_at: string | null
          id: string
          pump_id: string | null
          result: string
          scan_time: string | null
          scanned_by: string
          token_code: string | null
          token_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pump_id?: string | null
          result: string
          scan_time?: string | null
          scanned_by: string
          token_code?: string | null
          token_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pump_id?: string | null
          result?: string
          scan_time?: string | null
          scanned_by?: string
          token_code?: string | null
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_scans_pump_id_fkey"
            columns: ["pump_id"]
            isOneToOne: false
            referencedRelation: "pumps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_scans_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          booking_id: string
          created_at: string
          expiry_time: string
          id: string
          qr_data: string
          scan_time: string | null
          status: string
          token_code: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          expiry_time: string
          id?: string
          qr_data: string
          scan_time?: string | null
          status?: string
          token_code: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          expiry_time?: string
          id?: string
          qr_data?: string
          scan_time?: string | null
          status?: string
          token_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokens_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_token_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "pump_admin" | "user"
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
      app_role: ["super_admin", "pump_admin", "user"],
    },
  },
} as const
