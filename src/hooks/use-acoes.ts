import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      return data as Acao[];
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
      const { error } = await supabase.from("acoes").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acoes"] }); toast.success("Ação atualizada!"); },
    onError: () => toast.error("Erro ao atualizar ação."),
  });
}

export function useCreateAcao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (acao: Omit<Acao, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("acoes").insert(acao as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acoes"] }); },
    onError: () => toast.error("Erro ao criar ação."),
  });
}

export function useUploadAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ acaoId, file }: { acaoId: string; file: File }) => {
      const filePath = `${acaoId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("acoes-anexos").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { error: dbError } = await supabase.from("acoes_anexos").insert({
        acao_id: acaoId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
      } as any);
      if (dbError) throw dbError;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acoes_anexos"] }); toast.success("Arquivo anexado!"); },
    onError: () => toast.error("Erro ao anexar arquivo."),
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
