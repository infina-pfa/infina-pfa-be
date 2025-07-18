export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      budget_transactions: {
        Row: {
          budget_id: string;
          created_at: string;
          id: string;
          transaction_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          budget_id: string;
          created_at?: string;
          id?: string;
          transaction_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          budget_id?: string;
          created_at?: string;
          id?: string;
          transaction_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'budget_transactions_budget_id_fkey';
            columns: ['budget_id'];
            isOneToOne: false;
            referencedRelation: 'budgets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'budget_transactions_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      budgets: {
        Row: {
          amount: number;
          category: string;
          color: string;
          created_at: string;
          icon: string;
          id: string;
          month: number;
          name: string;
          updated_at: string;
          user_id: string;
          year: number;
        };
        Insert: {
          amount?: number;
          category?: string;
          color?: string;
          created_at?: string;
          icon?: string;
          id?: string;
          month: number;
          name: string;
          updated_at?: string;
          user_id: string;
          year: number;
        };
        Update: {
          amount?: number;
          category?: string;
          color?: string;
          created_at?: string;
          icon?: string;
          id?: string;
          month?: number;
          name?: string;
          updated_at?: string;
          user_id?: string;
          year?: number;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      debt_transactions: {
        Row: {
          created_at: string;
          debt_id: string;
          id: string;
          transaction_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          debt_id: string;
          id?: string;
          transaction_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          debt_id?: string;
          id?: string;
          transaction_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'debt_transactions_debt_id_fkey';
            columns: ['debt_id'];
            isOneToOne: false;
            referencedRelation: 'debts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'debt_transactions_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      debts: {
        Row: {
          amount: number;
          created_at: string;
          current_amount: number;
          description: string | null;
          due_date: string;
          id: string;
          interest_rate: number;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          current_amount: number;
          description?: string | null;
          due_date: string;
          id?: string;
          interest_rate?: number;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          current_amount?: number;
          description?: string | null;
          due_date?: string;
          id?: string;
          interest_rate?: number;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      goal_transactions: {
        Row: {
          created_at: string;
          goal_id: string;
          id: string;
          transaction_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          goal_id: string;
          id?: string;
          transaction_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          goal_id?: string;
          id?: string;
          transaction_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'goal_transactions_goal_id_fkey';
            columns: ['goal_id'];
            isOneToOne: false;
            referencedRelation: 'goals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'goal_transactions_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      goals: {
        Row: {
          created_at: string;
          current_amount: number;
          description: string | null;
          due_date: string | null;
          id: string;
          target_amount: number | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_amount?: number;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          target_amount?: number | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_amount?: number;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          target_amount?: number | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          sender: Database['public']['Enums']['message_sender'];
          type: Database['public']['Enums']['message_type'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          sender?: Database['public']['Enums']['message_sender'];
          type?: Database['public']['Enums']['message_type'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          sender?: Database['public']['Enums']['message_sender'];
          type?: Database['public']['Enums']['message_type'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      onboarding_chat: {
        Row: {
          component_id: string | null;
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          sender: Database['public']['Enums']['message_sender'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          component_id?: string | null;
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          sender: Database['public']['Enums']['message_sender'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          component_id?: string | null;
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          sender?: Database['public']['Enums']['message_sender'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'onboarding_chat_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      onboarding_profiles: {
        Row: {
          completed_at: string | null;
          created_at: string;
          expense: number | null;
          id: string;
          income: number | null;
          is_completed: boolean | null;
          profile_data: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          expense?: number | null;
          id?: string;
          income?: number | null;
          is_completed?: boolean | null;
          profile_data?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          expense?: number | null;
          id?: string;
          income?: number | null;
          is_completed?: boolean | null;
          profile_data?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      onboarding_responses: {
        Row: {
          component_id: string;
          created_at: string;
          id: string;
          response_data: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          component_id: string;
          created_at?: string;
          id?: string;
          response_data: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          component_id?: string;
          created_at?: string;
          id?: string;
          response_data?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          recurring: number;
          type: Database['public']['Enums']['transaction_type'];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          recurring: number;
          type?: Database['public']['Enums']['transaction_type'];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          recurring?: number;
          type?: Database['public']['Enums']['transaction_type'];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          budgeting_style:
            | Database['public']['Enums']['budgeting_style']
            | null;
          created_at: string;
          financial_stage: string | null;
          id: string;
          name: string;
          onboarding_completed_at: string | null;
          total_asset_value: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          budgeting_style?:
            | Database['public']['Enums']['budgeting_style']
            | null;
          created_at?: string;
          financial_stage?: string | null;
          id?: string;
          name: string;
          onboarding_completed_at?: string | null;
          total_asset_value?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          budgeting_style?:
            | Database['public']['Enums']['budgeting_style']
            | null;
          created_at?: string;
          financial_stage?: string | null;
          id?: string;
          name?: string;
          onboarding_completed_at?: string | null;
          total_asset_value?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      budgeting_style: 'detail_tracker' | 'goal_focused';
      message_sender: 'ai' | 'user' | 'system';
      message_type: 'text' | 'image' | 'photo' | 'component' | 'tool';
      transaction_type: 'income' | 'outcome' | 'transfer';
    };
    CompositeTypes: {
      vector: {
        values: number[] | null;
      };
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      budgeting_style: ['detail_tracker', 'goal_focused'],
      message_sender: ['ai', 'user', 'system'],
      message_type: ['text', 'image', 'photo', 'component', 'tool'],
      transaction_type: ['income', 'outcome', 'transfer'],
    },
  },
} as const;
