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
      business_projects: {
        Row: {
          budget: number
          business_id: string
          category: string | null
          created_at: string
          deadline: string | null
          description: string
          documentation_url: string | null
          id: string
          required_skills: string[] | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget: number
          business_id: string
          category?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          documentation_url?: string | null
          id?: string
          required_skills?: string[] | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number
          business_id?: string
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          documentation_url?: string | null
          id?: string
          required_skills?: string[] | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_verification_documents: {
        Row: {
          created_at: string
          doc_type: Database["public"]["Enums"]["business_verification_doc_type"]
          file_name: string
          id: string
          storage_path: string
          verification_id: string
        }
        Insert: {
          created_at?: string
          doc_type: Database["public"]["Enums"]["business_verification_doc_type"]
          file_name: string
          id?: string
          storage_path: string
          verification_id: string
        }
        Update: {
          created_at?: string
          doc_type?: Database["public"]["Enums"]["business_verification_doc_type"]
          file_name?: string
          id?: string
          storage_path?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_verification_documents_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "business_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      business_verifications: {
        Row: {
          company_type: Database["public"]["Enums"]["business_company_type"]
          created_at: string
          id: string
          registration_number: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["business_verification_status"]
          submitted_at: string | null
          tax_id_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_type?: Database["public"]["Enums"]["business_company_type"]
          created_at?: string
          id?: string
          registration_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["business_verification_status"]
          submitted_at?: string | null
          tax_id_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_type?: Database["public"]["Enums"]["business_company_type"]
          created_at?: string
          id?: string
          registration_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["business_verification_status"]
          submitted_at?: string | null
          tax_id_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          business_id: string
          created_at: string
          id: string
          message: string
          project_id: string
          status: Database["public"]["Enums"]["invite_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          message?: string
          project_id: string
          status?: Database["public"]["Enums"]["invite_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          message?: string
          project_id?: string
          status?: Database["public"]["Enums"]["invite_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          company_description: string | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          industry: string | null
          name: string | null
          portfolio_links: string[] | null
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          company_description?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          id: string
          industry?: string | null
          name?: string | null
          portfolio_links?: string[] | null
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          company_description?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          name?: string | null
          portfolio_links?: string[] | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          created_at: string
          id: string
          message: string
          project_id: string
          status: Database["public"]["Enums"]["proposal_status"]
          student_id: string
          timeline: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          project_id: string
          status?: Database["public"]["Enums"]["proposal_status"]
          student_id: string
          timeline: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          project_id?: string
          status?: Database["public"]["Enums"]["proposal_status"]
          student_id?: string
          timeline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          project_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          project_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          project_id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_projects: {
        Row: {
          category: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          project_url: string | null
          skills: string[] | null
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          project_url?: string | null
          skills?: string[] | null
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          project_url?: string | null
          skills?: string[] | null
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          message: string
          project_id: string
          project_url: string | null
          status: Database["public"]["Enums"]["submission_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          message?: string
          project_id: string
          project_url?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          message?: string
          project_id?: string
          project_url?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_projects"
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
      business_verification_is_approved: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_assigned_student: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_business: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "business" | "admin"
      business_company_type: "private_company" | "public_company"
      business_verification_doc_type:
        | "registration_certificate"
        | "tax_registration"
        | "proof_of_address"
        | "incorporation"
        | "directors_info"
        | "audited_financial"
      business_verification_status: "draft" | "pending_review" | "approved" | "rejected"
      invite_status: "pending" | "accepted" | "rejected"
      project_status: "open" | "in_progress" | "submitted" | "completed"
      proposal_status: "pending" | "accepted" | "rejected"
      submission_status: "submitted" | "revision_requested" | "approved"
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
      app_role: ["student", "business", "admin"],
      business_company_type: ["private_company", "public_company"],
      business_verification_doc_type: [
        "registration_certificate",
        "tax_registration",
        "proof_of_address",
        "incorporation",
        "directors_info",
        "audited_financial",
      ],
      business_verification_status: ["draft", "pending_review", "approved", "rejected"],
      invite_status: ["pending", "accepted", "rejected"],
      project_status: ["open", "in_progress", "submitted", "completed"],
      proposal_status: ["pending", "accepted", "rejected"],
      submission_status: ["submitted", "revision_requested", "approved"],
    },
  },
} as const
