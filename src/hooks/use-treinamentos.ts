import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Treinamento {
  id: string;
  mes: string;
  contrato: string;
  quantidade: number;
  created_at: string;
}

export function useTreinamentos() {
  return useQuery({
    queryKey: ["treinamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horas_treinamento")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Treinamento[];
    },
  });
}

export function useCreateTreinamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (treinamento: Omit<Treinamento, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("horas_treinamento")
        .insert(treinamento)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treinamentos"] });
      toast.success("Treinamento registrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar treinamento:", error);
      toast.error("Ocorreu um erro. Tente novamente.");
    },
  });
}
