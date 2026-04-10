import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Acidente {
  id: string;
  nome_empresa: string;
  chapa: number;
  nome: string;
  cargo: string;
  sexo: string;
  idade: number | null;
  escolaridade: string;
  tempo_empresa: string;
  tempo_funcao: string;
  rateio: string;
  contrato: string;
  regional: string;
  estado: string;
  data: string;
  hora: string | null;
  turno_trabalho: string;
  dia_semana: string;
  horas_trabalhadas: string;
  municipio: string;
  zona: string;
  tipologia_acidente: string;
  natureza_acidente: string;
  placa_veiculo: string;
  descricao: string;
  afastamento: string;
  dias_perdidos: number;
  dias_debitados: number;
  numero_cat: string;
  gravidade_lesao: string;
  identificacao_lesao: string;
  gravidade_acidente: string;
  tarefa_executada: string;
  tipo_evento: string;
  causas_basicas_tasc: string;
  causas_basicas_tasc_1: string;
  causas_basicas_tasc_2: string;
  causas_imediatas_tasc: string;
  causas_imediatas_tasc_1: string;
  causas_imediatas_tasc_2: string;
  nome_gestor: string;
  nome_responsavel: string;
  fatalidade: string;
  status_acidente: string;
  data_retorno: string | null;
  origem_fonte: string;
  id_comunica_seguranca_eqtl: string;
  transito_responsabilidades: string;
  parte_corpo_atingida: string;
  subdivisao_parte_corpo: string;
  situacao: string;
  cid: string;
  created_at: string;
}

export type AcidenteInput = Omit<Acidente, "id" | "created_at" | "situacao">;

async function logAudit(acidenteId: string, action: string, changes: Record<string, any> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("acidentes_audit_log").insert({
        acidente_id: acidenteId,
        user_id: user.id,
        user_email: user.email || "",
        action,
        changes,
      } as any);
    }
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

export function useAcidentes() {
  return useQuery({
    queryKey: ["acidentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acidentes")
        .select("*")
        .order("data", { ascending: false });
      if (error) throw error;
      return data as Acidente[];
    },
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as any).message);
  }
  return fallback;
}

export function useDeleteAcidente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("acidentes").delete().eq("id", id);
      if (error) throw error;
      await logAudit(id, "delete");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acidentes"] }); toast.success("Excluído!"); },
    onError: (error) => toast.error(getErrorMessage(error, "Erro ao excluir.")),
  });
}

export function useCreateAcidente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: AcidenteInput) => {
      const { data, error } = await supabase.from("acidentes").insert({ ...a, situacao: "Ativo" } as any).select().single();
      if (error) throw error;
      await logAudit(data.id, "create");
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acidentes"] }); toast.success("Registrado!"); },
    onError: (error) => toast.error(getErrorMessage(error, "Erro ao registrar.")),
  });
}

export function useUpdateAcidente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...a }: AcidenteInput & { id: string }) => {
      const { data, error } = await supabase.from("acidentes").update(a as any).eq("id", id).select().single();
      if (error) throw error;
      await logAudit(id, "update", a);
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acidentes"] }); toast.success("Atualizado!"); },
    onError: (error) => toast.error(getErrorMessage(error, "Erro ao atualizar.")),
  });
}

export function useBulkCreateAcidentes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (acidentes: AcidenteInput[]) => {
      const rows = acidentes.map(a => ({ ...a, situacao: "Ativo" }));
      const { data, error } = await supabase.from("acidentes").insert(rows as any).select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ["acidentes"] }); toast.success(`${data.length} importados!`); },
    onError: () => toast.error("Erro ao importar."),
  });
}
