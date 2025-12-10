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
      employee: {
        Row: {
          BANK_ACC_NAME: string | null
          BANK_ACC_NUMBER: string | null
          BANK_NAME: string | null
          BASE_SALARY: number | null
          CREATE_DATE: string
          COMPANY_NM: string
          DEPARTMENT_NM: string | null
          EMAIL: string
          EMP_ID: string
          EMP_LNAME: string
          EMP_NAME: string
          id: string
          IDENTIFY_NUMBER: string | null
          NICK_NAME: string | null
          POSITION_NM: string | null
          START_WORKING_DATE: string | null
          UPDATE_BY: string
        }
        Insert: {
          BANK_ACC_NAME?: string | null
          BANK_ACC_NUMBER?: string | null
          BANK_NAME?: string | null
          BASE_SALARY?: number | null
          COMPANY_NM: string
          CREATE_DATE?: string
          DEPARTMENT_NM?: string | null
          EMAIL: string
          EMP_ID: string
          EMP_LNAME: string
          EMP_NAME: string
          id?: string
          IDENTIFY_NUMBER?: string | null
          NICK_NAME?: string | null
          POSITION_NM?: string | null
          START_WORKING_DATE?: string | null
          UPDATE_BY?: string
        }
        Update: {
          BANK_ACC_NAME?: string | null
          BANK_ACC_NUMBER?: string | null
          BANK_NAME?: string | null
          BASE_SALARY?: number | null
          COMPANY_NM?: string
          CREATE_DATE?: string
          DEPARTMENT_NM?: string | null
          EMAIL?: string
          EMP_ID?: string
          EMP_LNAME?: string
          EMP_NAME?: string
          id?: string
          IDENTIFY_NUMBER?: string | null
          NICK_NAME?: string | null
          POSITION_NM?: string | null
          START_WORKING_DATE?: string | null
          UPDATE_BY?: string
        }
        Relationships: []
      }
      SALARY_DETAIL: {
        Row: {
          ALLOWANCE_AMT: number | null
          BANK_ACC_NAME: string | null
          BANK_ACC_NUMBER: string | null
          BANK_NAME: string | null
          BASE_SALARY: number | null
          BONUS_AMT: number | null
          COMPANY_NM: string | null
          CREATE_DATE: string
          DEDUCTION: number | null
          DEPARTMENT_NM: string | null
          EMAIL: string | null
          EMP_ID: string
          EMP_LNAME: string | null
          EMP_NAME: string | null
          id: string
          NET_PAYMENT: number | null
          NICK_NAME: string | null
          OT_AMT: number | null
          OT_TIME: number | null
          SSO_AMT: number | null
          STUDENT_LOAN: number | null
          TRANSFER_DATE: string | null
          UPDATE_BY: string
          WHT_AMT: number | null
        }
        Insert: {
          ALLOWANCE_AMT?: number | null
          BANK_ACC_NAME?: string | null
          BANK_ACC_NUMBER?: string | null
          BANK_NAME?: string | null
          BASE_SALARY?: number | null
          BONUS_AMT?: number | null
          COMPANY_NM?: string | null
          CREATE_DATE?: string
          DEDUCTION?: number | null
          DEPARTMENT_NM?: string | null
          EMAIL?: string | null
          EMP_ID: string
          EMP_LNAME?: string | null
          EMP_NAME?: string | null
          id?: string
          NET_PAYMENT?: number | null
          NICK_NAME?: string | null
          OT_AMT?: number | null
          OT_TIME?: number | null
          SSO_AMT?: number | null
          STUDENT_LOAN?: number | null
          TRANSFER_DATE?: string | null
          UPDATE_BY?: string
          WHT_AMT?: number | null
        }
        Update: {
          ALLOWANCE_AMT?: number | null
          BANK_ACC_NAME?: string | null
          BANK_ACC_NUMBER?: string | null
          BANK_NAME?: string | null
          BASE_SALARY?: number | null
          BONUS_AMT?: number | null
          COMPANY_NM?: string | null
          CREATE_DATE?: string
          DEDUCTION?: number | null
          DEPARTMENT_NM?: string | null
          EMAIL?: string | null
          EMP_ID?: string
          EMP_LNAME?: string | null
          EMP_NAME?: string | null
          id?: string
          NET_PAYMENT?: number | null
          NICK_NAME?: string | null
          OT_AMT?: number | null
          OT_TIME?: number | null
          SSO_AMT?: number | null
          STUDENT_LOAN?: number | null
          TRANSFER_DATE?: string | null
          UPDATE_BY?: string
          WHT_AMT?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "SALARY_DETAIL_EMP_ID_fkey"
            columns: ["EMP_ID"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["EMP_ID"]
          },
        ]
      }
      user_info: {
        Row: {
          CREATE_DATE: string
          EMAIL: string
          id: string
          lname: string
          name: string
          NICK_NAME: string | null
          UPDATE_BY: string
          user_name: string
          user_pass: string
        }
        Insert: {
          CREATE_DATE?: string
          EMAIL: string
          id?: string
          lname: string
          name: string
          NICK_NAME?: string | null
          UPDATE_BY?: string
          user_name: string
          user_pass: string
        }
        Update: {
          CREATE_DATE?: string
          EMAIL?: string
          id?: string
          lname?: string
          name?: string
          NICK_NAME?: string | null
          UPDATE_BY?: string
          user_name?: string
          user_pass?: string
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
