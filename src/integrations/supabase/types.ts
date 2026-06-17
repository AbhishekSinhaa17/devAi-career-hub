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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_usage_events: {
        Row: {
          completion_tokens: number
          cost_usd: number
          created_at: string
          duration_ms: number
          endpoint: string
          id: string
          model: string
          prompt_tokens: number
          status: string
          total_tokens: number
          user_id: string | null
        }
        Insert: {
          completion_tokens?: number
          cost_usd?: number
          created_at?: string
          duration_ms?: number
          endpoint: string
          id?: string
          model: string
          prompt_tokens?: number
          status?: string
          total_tokens?: number
          user_id?: string | null
        }
        Update: {
          completion_tokens?: number
          cost_usd?: number
          created_at?: string
          duration_ms?: number
          endpoint?: string
          id?: string
          model?: string
          prompt_tokens?: number
          status?: string
          total_tokens?: number
          user_id?: string | null
        }
        Relationships: []
      }
      code_reviews: {
        Row: {
          code: string
          created_at: string
          feedback: Json
          id: string
          language: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          feedback?: Json
          id?: string
          language?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          feedback?: Json
          id?: string
          language?: string
          user_id?: string
        }
        Relationships: []
      }
      copilot_conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          context_snapshot: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          context_snapshot?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          context_snapshot?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      copilot_messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "copilot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "copilot_conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      developer_health_scores: {
        Row: {
          created_at: string
          github_score: number
          id: string
          interview_score: number
          job_match_score: number
          overall_score: number
          portfolio_score: number
          recommendations: Json
          resume_score: number
          strengths: Json
          updated_at: string
          user_id: string
          weaknesses: Json
        }
        Insert: {
          created_at?: string
          github_score: number
          id?: string
          interview_score: number
          job_match_score: number
          overall_score: number
          portfolio_score: number
          recommendations?: Json
          resume_score: number
          strengths?: Json
          updated_at?: string
          user_id: string
          weaknesses?: Json
        }
        Update: {
          created_at?: string
          github_score?: number
          id?: string
          interview_score?: number
          job_match_score?: number
          overall_score?: number
          portfolio_score?: number
          recommendations?: Json
          resume_score?: number
          strengths?: Json
          updated_at?: string
          user_id?: string
          weaknesses?: Json
        }
        Relationships: []
      }
      developer_scores: {
        Row: {
          ai_insights: Json
          certifications: Json
          created_at: string
          github_score: number
          id: string
          interview_score: number
          job_match_score: number
          job_roles: Json
          overall_score: number
          profile_score: number
          recommendations: Json
          resume_score: number
          strengths: Json
          suggested_projects: Json
          user_id: string
          weaknesses: Json
        }
        Insert: {
          ai_insights?: Json
          certifications?: Json
          created_at?: string
          github_score: number
          id?: string
          interview_score: number
          job_match_score: number
          job_roles?: Json
          overall_score: number
          profile_score: number
          recommendations?: Json
          resume_score: number
          strengths?: Json
          suggested_projects?: Json
          user_id: string
          weaknesses?: Json
        }
        Update: {
          ai_insights?: Json
          certifications?: Json
          created_at?: string
          github_score?: number
          id?: string
          interview_score?: number
          job_match_score?: number
          job_roles?: Json
          overall_score?: number
          profile_score?: number
          recommendations?: Json
          resume_score?: number
          strengths?: Json
          suggested_projects?: Json
          user_id?: string
          weaknesses?: Json
        }
        Relationships: []
      }
      github_analyses: {
        Row: {
          created_at: string
          github_username: string
          id: string
          score: number
          stats: Json
          strengths: string[]
          suggestions: string[]
          summary: string | null
          user_id: string
          weaknesses: string[]
        }
        Insert: {
          created_at?: string
          github_username: string
          id?: string
          score?: number
          stats?: Json
          strengths?: string[]
          suggestions?: string[]
          summary?: string | null
          user_id: string
          weaknesses?: string[]
        }
        Update: {
          created_at?: string
          github_username?: string
          id?: string
          score?: number
          stats?: Json
          strengths?: string[]
          suggestions?: string[]
          summary?: string | null
          user_id?: string
          weaknesses?: string[]
        }
        Relationships: []
      }
      github_resumes: {
        Row: {
          badges: Json
          created_at: string
          developer_type: string
          github_username: string
          id: string
          insights: Json
          is_public: boolean
          profile_strength: number
          resume_data: Json
          user_id: string
        }
        Insert: {
          badges?: Json
          created_at?: string
          developer_type: string
          github_username: string
          id?: string
          insights?: Json
          is_public?: boolean
          profile_strength?: number
          resume_data: Json
          user_id: string
        }
        Update: {
          badges?: Json
          created_at?: string
          developer_type?: string
          github_username?: string
          id?: string
          insights?: Json
          is_public?: boolean
          profile_strength?: number
          resume_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          category: string
          created_at: string
          id: string
          questions: Json
          role: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          questions?: Json
          role: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          questions?: Json
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      job_matches: {
        Row: {
          ai_summary: string | null
          analysis: Json
          ats_score: number
          created_at: string
          hiring_probability: number
          id: string
          interview_readiness: number
          job_description: string
          job_role: string
          resume_file_name: string
          resume_text: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          analysis?: Json
          ats_score: number
          created_at?: string
          hiring_probability: number
          id?: string
          interview_readiness: number
          job_description: string
          job_role: string
          resume_file_name: string
          resume_text: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          analysis?: Json
          ats_score?: number
          created_at?: string
          hiring_probability?: number
          id?: string
          interview_readiness?: number
          job_description?: string
          job_role?: string
          resume_file_name?: string
          resume_text?: string
          user_id?: string
        }
        Relationships: []
      }
      mock_interviews: {
        Row: {
          answers: Json
          created_at: string
          experience_level: string
          id: string
          interview_type: string
          job_role: string
          overall_score: number
          questions: Json
          report: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          experience_level: string
          id?: string
          interview_type: string
          job_role: string
          overall_score?: number
          questions?: Json
          report?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          experience_level?: string
          id?: string
          interview_type?: string
          job_role?: string
          overall_score?: number
          questions?: Json
          report?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_deployments: {
        Row: {
          created_at: string
          deployment_id: string
          deployment_url: string | null
          build_duration: number | null
          deployed_at: string | null
          id: string
          portfolio_id: string
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deployment_id: string
          deployment_url?: string | null
          build_duration?: number | null
          deployed_at?: string | null
          id?: string
          portfolio_id: string
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deployment_id?: string
          deployment_url?: string | null
          build_duration?: number | null
          deployed_at?: string | null
          id?: string
          portfolio_id?: string
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_deployments_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "github_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: string[]
          best_interview_score: number
          bio: string | null
          created_at: string
          email: string | null
          experience_level: string
          github_username: string | null
          id: string
          interview_streak: number
          name: string | null
          skills: string[]
          total_interviews: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          badges?: string[]
          best_interview_score?: number
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string
          github_username?: string | null
          id: string
          interview_streak?: number
          name?: string | null
          skills?: string[]
          total_interviews?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          badges?: string[]
          best_interview_score?: number
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string
          github_username?: string | null
          id?: string
          interview_streak?: number
          name?: string | null
          skills?: string[]
          total_interviews?: number
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          ai_suggestions: string[]
          content: Json
          created_at: string
          id: string
          score: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggestions?: string[]
          content?: Json
          created_at?: string
          id?: string
          score?: number
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggestions?: string[]
          content?: Json
          created_at?: string
          id?: string
          score?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          created_at: string
          id: string
          path: string
          roadmap: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          roadmap?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          roadmap?: Json
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "developer"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "developer"],
    },
  },
} as const
