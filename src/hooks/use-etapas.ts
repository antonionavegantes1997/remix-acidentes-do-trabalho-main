import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EtapaInvestigacao {
  id: string;
  acidente_id: string;
  responsavel_nome: string;
  responsavel_etapa1: string;
  responsavel_etapa2: string;
  responsavel_etapa3: string;
  responsavel_etapa4: string;
  responsavel_etapa5: string;
  responsavel_etapa6: string;
  responsavel_etapa7: string;
  responsavel_etapa8: string;
  responsavel_etapa9: string;
  etapa1_data: string | null;
  etapa2_data: string | null;
  etapa3_data: string | null;
  etapa4_data: string | null;
  etapa5_data: string | null;
  etapa6_data: string | null;
  etapa7_data: string | null;
  etapa8_data: string | null;
  etapa9_data: string | null;
  created_at: string;
  updated_at: string;
}

export const ETAPAS_CONFIG = [
  { key: "etapa1_data" as const, respKey: "responsavel_etapa1" as const, label: "1) Cadastro no Comunica EQTL", prazoHoras: null },
  { key: "etapa2_data" as const, respKey: "responsavel_etapa2" as const, label: "2) Envio torpedo WhatsApp ao SESMT EQTL", prazoHoras: null },
  { key: "etapa3_data" as const, respKey: "responsavel_etapa3" as const, label: "3) Envio torpedo WhatsApp ao SESMT e Gerência CGB", prazoHoras: null },
  { key: "etapa4_data" as const, respKey: "responsavel_etapa4" as const, label: "4) Envio Comunicação de Acidente (formulário EQTL) ao SESMT EQTL", prazoHoras: 24 },
  { key: "etapa6_data" as const, respKey: "responsavel_etapa6" as const, label: "5) Abertura da CAT", prazoHoras: 24 },
  { key: "etapa5_data" as const, respKey: "responsavel_etapa5" as const, label: "6) Análise do Evento (CAUSAS, metodologia TASC)", prazoHoras: 72 },
  { key: "etapa7_data" as const, respKey: "responsavel_etapa7" as const, label: "7) Preenchimento do Plano de Ação para cada CAUSA APONTADA", prazoHoras: null },
  { key: "etapa8_data" as const, respKey: "responsavel_etapa8" as const, label: "8) Envio do Quadrante ao SESMT EQTL via e-mail", prazoHoras: 120 },
  { key: "etapa9_data" as const, respKey: "responsavel_etapa9" as const, label: "9) Envio do RELATÓRIO ao SESMT EQTL, SESMT CGB, GUADIX via e-mail", prazoHoras: null },
];

export function useEtapas() {
  return useQuery({
    queryKey: ["etapas_investigacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("etapas_investigacao")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EtapaInvestigacao[];
    },
  });
}

export function useCreateEtapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (etapa: { acidente_id: string; responsavel_nome: string }) => {
      const { data, error } = await supabase
        .from("etapas_investigacao")
        .insert(etapa)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["etapas_investigacao"] }),
    onError: () => toast.error("Erro ao criar etapa."),
  });
}

export function useUpdateEtapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EtapaInvestigacao> & { id: string }) => {
      const { error } = await supabase
        .from("etapas_investigacao")
        .update(updates as Partial<EtapaInvestigacao>)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["etapas_investigacao"] });
      toast.success("Etapa atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar etapa."),
  });
}
