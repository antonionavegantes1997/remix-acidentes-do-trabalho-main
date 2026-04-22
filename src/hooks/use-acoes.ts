import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALLOWED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function isMissingDataRealizadaColumn(error: unknown) {
  const message = (error as { message?: string; details?: string; hint?: string } | null)?.message ?? "";
  const details = (error as { details?: string } | null)?.details ?? "";
  const hint = (error as { hint?: string } | null)?.hint ?? "";
  const text = `${message} ${details} ${hint}`.toLowerCase();
  return text.includes("data_realizada_execucao");
}

function stripDataRealizadaField<T extends Record<string, unknown>>(payload: T): Omit<T, "data_realizada_execucao"> {
  const { data_realizada_execucao: _ignored, ...rest } = payload;
  return rest;
}

function normalizeAcao(acao: Record<string, unknown>) {
  return {
    ...acao,
    data_realizada_execucao: (acao.data_realizada_execucao as string | null | undefined) ?? null,
  };
}

export interface Acao {
  id: string;
  acidente_id: string;
  causa_tipo: string;
  causa_descricao: string;
  acao: string;
  corretiva: string;
  preventiva: string;
  responsavel_execucao: string;
  data_prevista_execucao: string | null;
  data_realizada_execucao: string | null;
  situacao_atual: string;
  created_at: string;
  updated_at: string;
}

export interface AcaoAnexo {
  id: string;
  acao_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

export function useAcoes() {
  return useQuery({
    queryKey: ["acoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acoes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((item) => normalizeAcao(item as Record<string, unknown>)) as Acao[];
    },
  });
}

export function useAcoesAnexos(acaoIds: string[]) {
  return useQuery({
    queryKey: ["acoes_anexos", acaoIds],
    queryFn: async () => {
      if (!acaoIds.length) return [];
      const { data, error } = await supabase
        .from("acoes_anexos")
        .select("*")
        .in("acao_id", acaoIds);
      if (error) throw error;
      return data as AcaoAnexo[];
    },
    enabled: acaoIds.length > 0,
  });
}

export function useUpdateAcao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Acao> & { id: string }) => {
      let { error } = await supabase.from("acoes").update(updates as Partial<Acao>).eq("id", id);
      if (error && isMissingDataRealizadaColumn(error) && "data_realizada_execucao" in updates) {
        const fallbackUpdates = stripDataRealizadaField(updates as Record<string, unknown>);
        ({ error } = await supabase.from("acoes").update(fallbackUpdates).eq("id", id));
      }
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acoes"] }); toast.success("Ação atualizada!"); },
    onError: (error: unknown) => toast.error((error as Error)?.message ?? "Erro ao atualizar ação."),
  });
}

export function useCreateAcao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (acao: Omit<Acao, "id" | "created_at" | "updated_at">) => {
      let { data, error } = await supabase.from("acoes").insert(acao).select().single();
      if (error && isMissingDataRealizadaColumn(error) && "data_realizada_execucao" in acao) {
        const fallbackPayload = stripDataRealizadaField(acao as unknown as Record<string, unknown>);
        ({ data, error } = await supabase.from("acoes").insert(fallbackPayload).select().single());
      }
      if (error) throw error;
      return normalizeAcao((data ?? {}) as Record<string, unknown>);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acoes"] }); },
    onError: (error: unknown) => toast.error((error as Error)?.message ?? "Erro ao criar ação."),
  });
}

export function useUploadAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ acaoId, file }: { acaoId: string; file: File }) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("Arquivo acima do limite de 5MB.");
      }
      if (!ALLOWED_FILE_TYPES.has(file.type)) {
        throw new Error("Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou PDF.");
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${acaoId}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage.from("acoes-anexos").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { error: dbError } = await supabase.from("acoes_anexos").insert({
        acao_id: acaoId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
      } as Omit<AcaoAnexo, "id" | "created_at">);
      if (dbError) throw dbError;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acoes_anexos"] }); toast.success("Arquivo anexado!"); },
    onError: (error: unknown) => toast.error((error as Error)?.message ?? "Erro ao anexar arquivo."),
  });
}

export function useDeleteAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (anexo: AcaoAnexo) => {
      await supabase.storage.from("acoes-anexos").remove([anexo.file_path]);
      const { error } = await supabase.from("acoes_anexos").delete().eq("id", anexo.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acoes_anexos"] }); toast.success("Arquivo removido!"); },
    onError: () => toast.error("Erro ao remover arquivo."),
  });
}
