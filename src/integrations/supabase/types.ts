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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      episodes: {
        Row: {
          audio_url: string | null
          city: string | null
          created_at: string
          created_by: string | null
          duration_seconds: number | null
          id: string
          language: string | null
          like_count: number
          moderation_notes: string | null
          play_count: number
          published_at: string | null
          requires_approval: boolean
          scheduled_at: string | null
          script: Json
          script_text: string | null
          sensitive_category: string | null
          show_id: string
          source_links: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          like_count?: number
          moderation_notes?: string | null
          play_count?: number
          published_at?: string | null
          requires_approval?: boolean
          scheduled_at?: string | null
          script?: Json
          script_text?: string | null
          sensitive_category?: string | null
          show_id: string
          source_links?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          like_count?: number
          moderation_notes?: string | null
          play_count?: number
          published_at?: string | null
          requires_approval?: boolean
          scheduled_at?: string | null
          script?: Json
          script_text?: string | null
          sensitive_category?: string | null
          show_id?: string
          source_links?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_flags: {
        Row: {
          created_at: string
          episode_id: string
          flag_type: string
          id: string
          reason: string | null
          resolved: boolean
          severity: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          flag_type: string
          id?: string
          reason?: string | null
          resolved?: boolean
          severity?: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          flag_type?: string
          id?: string
          reason?: string | null
          resolved?: boolean
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_flags_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      news_items: {
        Row: {
          approved: boolean
          category: string | null
          city: string | null
          created_at: string
          credibility_score: number | null
          duplicate_group_id: string | null
          duplicate_hash: string | null
          fetched_at: string
          id: string
          published_at: string | null
          source_id: string | null
          status: string
          summary: string | null
          title: string
          url: string | null
        }
        Insert: {
          approved?: boolean
          category?: string | null
          city?: string | null
          created_at?: string
          credibility_score?: number | null
          duplicate_group_id?: string | null
          duplicate_hash?: string | null
          fetched_at?: string
          id?: string
          published_at?: string | null
          source_id?: string | null
          status?: string
          summary?: string | null
          title: string
          url?: string | null
        }
        Update: {
          approved?: boolean
          category?: string | null
          city?: string | null
          created_at?: string
          credibility_score?: number | null
          duplicate_group_id?: string | null
          duplicate_hash?: string | null
          fetched_at?: string
          id?: string
          published_at?: string | null
          source_id?: string | null
          status?: string
          summary?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_runs: {
        Row: {
          audio_generated: number
          city: string | null
          episodes_created: number
          episodes_pending_approval: number
          error: string | null
          finished_at: string | null
          id: string
          news_fetched: number
          show_id: string | null
          started_at: string
          status: string
          triggered_by: string
        }
        Insert: {
          audio_generated?: number
          city?: string | null
          episodes_created?: number
          episodes_pending_approval?: number
          error?: string | null
          finished_at?: string | null
          id?: string
          news_fetched?: number
          show_id?: string | null
          started_at?: string
          status?: string
          triggered_by?: string
        }
        Update: {
          audio_generated?: number
          city?: string | null
          episodes_created?: number
          episodes_pending_approval?: number
          error?: string | null
          finished_at?: string | null
          id?: string
          news_fetched?: number
          show_id?: string | null
          started_at?: string
          status?: string
          triggered_by?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          language: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          language?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          city: string | null
          created_at: string
          day_of_week: number | null
          id: string
          is_active: boolean
          show_id: string
          time_of_day: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          day_of_week?: number | null
          id?: string
          is_active?: boolean
          show_id: string
          time_of_day: string
        }
        Update: {
          city?: string | null
          created_at?: string
          day_of_week?: number | null
          id?: string
          is_active?: boolean
          show_id?: string
          time_of_day?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      shows: {
        Row: {
          accent_color: string | null
          city: string | null
          created_at: string
          default_duration: number | null
          description: string | null
          format_type: string
          id: string
          is_active: boolean
          language: string | null
          name: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          city?: string | null
          created_at?: string
          default_duration?: number | null
          description?: string | null
          format_type: string
          id?: string
          is_active?: boolean
          language?: string | null
          name: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          city?: string | null
          created_at?: string
          default_duration?: number | null
          description?: string | null
          format_type?: string
          id?: string
          is_active?: boolean
          language?: string | null
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          api_provider: string | null
          approved_domain_only: boolean
          category: string | null
          city: string | null
          created_at: string
          credibility_score: number | null
          id: string
          is_active: boolean
          language: string | null
          name: string
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          api_provider?: string | null
          approved_domain_only?: boolean
          category?: string | null
          city?: string | null
          created_at?: string
          credibility_score?: number | null
          id?: string
          is_active?: boolean
          language?: string | null
          name: string
          type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          api_provider?: string | null
          approved_domain_only?: boolean
          category?: string | null
          city?: string | null
          created_at?: string
          credibility_score?: number | null
          id?: string
          is_active?: boolean
          language?: string | null
          name?: string
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      user_requests: {
        Row: {
          city: string | null
          created_at: string
          id: string
          request_text: string
          status: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          request_text: string
          status?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          request_text?: string
          status?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
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
      voices: {
        Row: {
          character_name: string
          created_at: string
          id: string
          is_active: boolean
          language: string | null
          pitch: number | null
          provider: string
          speaker: string | null
          speed: number | null
          target_language_code: string | null
          tone: string | null
          voice_id: string | null
        }
        Insert: {
          character_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string | null
          pitch?: number | null
          provider?: string
          speaker?: string | null
          speed?: number | null
          target_language_code?: string | null
          tone?: string | null
          voice_id?: string | null
        }
        Update: {
          character_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string | null
          pitch?: number | null
          provider?: string
          speaker?: string | null
          speed?: number | null
          target_language_code?: string | null
          tone?: string | null
          voice_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "listener"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "listener"],
    },
  },
} as const
