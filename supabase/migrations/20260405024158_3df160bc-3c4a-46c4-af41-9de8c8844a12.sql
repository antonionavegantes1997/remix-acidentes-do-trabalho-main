
-- Add causas básicas split columns
ALTER TABLE public.acidentes ADD COLUMN IF NOT EXISTS causas_basicas_tasc_1 text NOT NULL DEFAULT '';
ALTER TABLE public.acidentes ADD COLUMN IF NOT EXISTS causas_basicas_tasc_2 text NOT NULL DEFAULT '';

-- Create acoes table linked to acidentes
CREATE TABLE public.acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acidente_id uuid REFERENCES public.acidentes(id) ON DELETE CASCADE NOT NULL,
  causa_tipo text NOT NULL DEFAULT '',
  causa_descricao text NOT NULL DEFAULT '',
  acao text NOT NULL DEFAULT '',
  corretiva text NOT NULL DEFAULT '',
  preventiva text NOT NULL DEFAULT '',
  responsavel_execucao text NOT NULL DEFAULT '',
  data_prevista_execucao date,
  situacao_atual text NOT NULL DEFAULT 'Aguardando análise',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.acoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Somente autenticados podem ver acoes" ON public.acoes FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Somente autenticados podem inserir acoes" ON public.acoes FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Somente autenticados podem atualizar acoes" ON public.acoes FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Somente autenticados podem deletar acoes" ON public.acoes FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Create acoes_anexos table for file attachments
CREATE TABLE public.acoes_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acao_id uuid REFERENCES public.acoes(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL DEFAULT '',
  file_path text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.acoes_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Somente autenticados podem ver acoes_anexos" ON public.acoes_anexos FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Somente autenticados podem inserir acoes_anexos" ON public.acoes_anexos FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Somente autenticados podem deletar acoes_anexos" ON public.acoes_anexos FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Create storage bucket for ações attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('acoes-anexos', 'acoes-anexos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth users can upload acoes files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'acoes-anexos');
CREATE POLICY "Anyone can view acoes files" ON storage.objects FOR SELECT USING (bucket_id = 'acoes-anexos');
CREATE POLICY "Auth users can delete acoes files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'acoes-anexos');
