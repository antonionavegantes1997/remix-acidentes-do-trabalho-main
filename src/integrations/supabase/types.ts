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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      acidentes: {
        Row: {
          acoes_imediatas: string
          afastamento: string
          cargo: string
          causas_basicas_tasc: string
          causas_basicas_tasc_1: string
          causas_basicas_tasc_2: string
          causas_imediatas_tasc: string
          causas_imediatas_tasc_1: string
          causas_imediatas_tasc_2: string
          chapa: number
          cid: string
          contrato: string
          created_at: string
          data: string
          data_retorno: string | null
          descricao: string
          dia_semana: string
          dias_afastamento: number
          dias_debitados: number
          dias_perdidos: number
          escolaridade: string
          estado: string
          fatalidade: string
          gravidade_acidente: string
          gravidade_lesao: string
          hora: string | null
          horas_trabalhadas: string
          id: string
          id_comunica_seguranca_eqtl: string
          idade: number | null
          identificacao_lesao: string
          municipio: string
          natureza_acidente: string
          nome: string
          nome_empresa: string
          nome_gestor: string
          nome_responsavel: string
          numero_cat: string
          origem_fonte: string
          parte_corpo_atingida: string
          placa_veiculo: string
          rateio: string
          regional: string
          sexo: string
          situacao: Database["public"]["Enums"]["situacao_acidente"]
          status_acidente: string
          subdivisao_parte_corpo: string
          tarefa_executada: string
          tempo_empresa: string
          tempo_funcao: string
          tipo_evento: string
          tipologia_acidente: string
          transito_responsabilidades: string
          turno_trabalho: string
          zona: string
        }
        Insert: {
          acoes_imediatas?: string
          afastamento?: string
          cargo?: string
          causas_basicas_tasc?: string
          causas_basicas_tasc_1?: string
          causas_basicas_tasc_2?: string
          causas_imediatas_tasc?: string
          causas_imediatas_tasc_1?: string
          causas_imediatas_tasc_2?: string
          chapa: number
          cid?: string
          contrato?: string
          created_at?: string
          data: string
          data_retorno?: string | null
          descricao?: string
          dia_semana?: string
          dias_afastamento?: number
          dias_debitados?: number
          dias_perdidos?: number
          escolaridade?: string
          estado?: string
          fatalidade?: string
          gravidade_acidente?: string
          gravidade_lesao?: string
          hora?: string | null
          horas_trabalhadas?: string
          id?: string
          id_comunica_seguranca_eqtl?: string
          idade?: number | null
          identificacao_lesao?: string
          municipio?: string
          natureza_acidente?: string
          nome: string
          nome_empresa?: string
          nome_gestor?: string
          nome_responsavel?: string
          numero_cat?: string
          origem_fonte?: string
          parte_corpo_atingida?: string
          placa_veiculo?: string
          rateio: string
          regional?: string
          sexo?: string
          situacao?: Database["public"]["Enums"]["situacao_acidente"]
          status_acidente?: string
          subdivisao_parte_corpo?: string
          tarefa_executada?: string
          tempo_empresa?: string
          tempo_funcao?: string
          tipo_evento?: string
          tipologia_acidente?: string
          transito_responsabilidades?: string
          turno_trabalho?: string
          zona?: string
        }
        Update: {
          acoes_imediatas?: string
          afastamento?: string
          cargo?: string
          causas_basicas_tasc?: string
          causas_basicas_tasc_1?: string
          causas_basicas_tasc_2?: string
          causas_imediatas_tasc?: string
          causas_imediatas_tasc_1?: string
          causas_imediatas_tasc_2?: string
          chapa?: number
          cid?: string
          contrato?: string
          created_at?: string
          data?: string
          data_retorno?: string | null
          descricao?: string
          dia_semana?: string
          dias_afastamento?: number
          dias_debitados?: number
          dias_perdidos?: number
          escolaridade?: string
          estado?: string
          fatalidade?: string
          gravidade_acidente?: string
          gravidade_lesao?: string
          hora?: string | null
          horas_trabalhadas?: string
          id?: string
          id_comunica_seguranca_eqtl?: string
          idade?: number | null
          identificacao_lesao?: string
          municipio?: string
          natureza_acidente?: string
          nome?: string
          nome_empresa?: string
          nome_gestor?: string
          nome_responsavel?: string
          numero_cat?: string
          origem_fonte?: string
          parte_corpo_atingida?: string
          placa_veiculo?: string
          rateio?: string
          regional?: string
          sexo?: string
          situacao?: Database["public"]["Enums"]["situacao_acidente"]
          status_acidente?: string
          subdivisao_parte_corpo?: string
          tarefa_executada?: string
          tempo_empresa?: string
          tempo_funcao?: string
          tipo_evento?: string
          tipologia_acidente?: string
          transito_responsabilidades?: string
          turno_trabalho?: string
          zona?: string
        }
        Relationships: []
      }
      acidentes_audit_log: {
        Row: {
          acidente_id: string
          action: string
          changes: Json
          created_at: string
          id: string
          user_email: string
          user_id: string
        }
        Insert: {
          acidente_id: string
          action?: string
          changes?: Json
          created_at?: string
          id?: string
          user_email?: string
          user_id: string
        }
        Update: {
          acidente_id?: string
          action?: string
          changes?: Json
          created_at?: string
          id?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      acoes: {
        Row: {
          acao: string
          acidente_id: string
          causa_descricao: string
          causa_tipo: string
          corretiva: string
          created_at: string
          data_prevista_execucao: string | null
          data_realizada_execucao: string | null
          id: string
          preventiva: string
          responsavel_execucao: string
          situacao_atual: string
          updated_at: string
        }
        Insert: {
          acao?: string
          acidente_id: string
          causa_descricao?: string
          causa_tipo?: string
          corretiva?: string
          created_at?: string
          data_prevista_execucao?: string | null
          data_realizada_execucao?: string | null
          id?: string
          preventiva?: string
          responsavel_execucao?: string
          situacao_atual?: string
          updated_at?: string
        }
        Update: {
          acao?: string
          acidente_id?: string
          causa_descricao?: string
          causa_tipo?: string
          corretiva?: string
          created_at?: string
          data_prevista_execucao?: string | null
          data_realizada_execucao?: string | null
          id?: string
          preventiva?: string
          responsavel_execucao?: string
          situacao_atual?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_acidente_id_fkey"
            columns: ["acidente_id"]
            isOneToOne: false
            referencedRelation: "acidentes"
            referencedColumns: ["id"]
          },
        ]
      }
      acoes_anexos: {
        Row: {
          acao_id: string
          created_at: string
          file_name: string
          file_path: string
          file_type: string
          id: string
        }
        Insert: {
          acao_id: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
        }
        Update: {
          acao_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_anexos_acao_id_fkey"
            columns: ["acao_id"]
            isOneToOne: false
            referencedRelation: "acoes"
            referencedColumns: ["id"]
          },
        ]
      }
      etapas_investigacao: {
        Row: {
          acidente_id: string
          created_at: string
          etapa1_data: string | null
          etapa2_data: string | null
          etapa3_data: string | null
          etapa4_data: string | null
          etapa5_data: string | null
          etapa6_data: string | null
          etapa7_data: string | null
          etapa8_data: string | null
          etapa9_data: string | null
          id: string
          responsavel_etapa1: string
          responsavel_etapa2: string
          responsavel_etapa3: string
          responsavel_etapa4: string
          responsavel_etapa5: string
          responsavel_etapa6: string
          responsavel_etapa7: string
          responsavel_etapa8: string
          responsavel_etapa9: string
          responsavel_nome: string
          updated_at: string
        }
        Insert: {
          acidente_id: string
          created_at?: string
          etapa1_data?: string | null
          etapa2_data?: string | null
          etapa3_data?: string | null
          etapa4_data?: string | null
          etapa5_data?: string | null
          etapa6_data?: string | null
          etapa7_data?: string | null
          etapa8_data?: string | null
          etapa9_data?: string | null
          id?: string
          responsavel_etapa1?: string
          responsavel_etapa2?: string
          responsavel_etapa3?: string
          responsavel_etapa4?: string
          responsavel_etapa5?: string
          responsavel_etapa6?: string
          responsavel_etapa7?: string
          responsavel_etapa8?: string
          responsavel_etapa9?: string
          responsavel_nome?: string
          updated_at?: string
        }
        Update: {
          acidente_id?: string
          created_at?: string
          etapa1_data?: string | null
          etapa2_data?: string | null
          etapa3_data?: string | null
          etapa4_data?: string | null
          etapa5_data?: string | null
          etapa6_data?: string | null
          etapa7_data?: string | null
          etapa8_data?: string | null
          etapa9_data?: string | null
          id?: string
          responsavel_etapa1?: string
          responsavel_etapa2?: string
          responsavel_etapa3?: string
          responsavel_etapa4?: string
          responsavel_etapa5?: string
          responsavel_etapa6?: string
          responsavel_etapa7?: string
          responsavel_etapa8?: string
          responsavel_etapa9?: string
          responsavel_nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "etapas_investigacao_acidente_id_fkey"
            columns: ["acidente_id"]
            isOneToOne: true
            referencedRelation: "acidentes"
            referencedColumns: ["id"]
          },
        ]
      }
      horas_treinamento: {
        Row: {
          contrato: string
          created_at: string
          id: string
          mes: string
          quantidade: number
        }
        Insert: {
          contrato: string
          created_at?: string
          id?: string
          mes: string
          quantidade?: number
        }
        Update: {
          contrato?: string
          created_at?: string
          id?: string
          mes?: string
          quantidade?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "gestor"
      situacao_acidente: "Ativo" | "Finalizado"
      tipo_acidente:
        | "Típico"
        | "Trajeto"
        | "Sinistro de Trânsito"
        | "Primeiros Socorros"
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
      app_role: ["admin", "gestor"],
      situacao_acidente: ["Ativo", "Finalizado"],
      tipo_acidente: [
        "Típico",
        "Trajeto",
        "Sinistro de Trânsito",
        "Primeiros Socorros",
      ],
    },
  },
} as const
