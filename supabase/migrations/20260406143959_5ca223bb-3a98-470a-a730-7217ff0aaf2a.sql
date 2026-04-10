
-- Add causas_imediatas_tasc_1 and causas_imediatas_tasc_2 columns
ALTER TABLE public.acidentes ADD COLUMN IF NOT EXISTS causas_imediatas_tasc_1 text NOT NULL DEFAULT '';
ALTER TABLE public.acidentes ADD COLUMN IF NOT EXISTS causas_imediatas_tasc_2 text NOT NULL DEFAULT '';

-- Create etapas_investigacao table
CREATE TABLE public.etapas_investigacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acidente_id uuid NOT NULL REFERENCES public.acidentes(id) ON DELETE CASCADE,
  responsavel_nome text NOT NULL DEFAULT '',
  etapa1_data timestamp with time zone,
  etapa2_data timestamp with time zone,
  etapa3_data timestamp with time zone,
  etapa4_data timestamp with time zone,
  etapa5_data timestamp with time zone,
  etapa6_data timestamp with time zone,
  etapa7_data timestamp with time zone,
  etapa8_data timestamp with time zone,
  etapa9_data timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(acidente_id)
);

-- Enable RLS
ALTER TABLE public.etapas_investigacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Somente autenticados podem ver etapas"
  ON public.etapas_investigacao FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Somente autenticados podem inserir etapas"
  ON public.etapas_investigacao FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Somente autenticados podem atualizar etapas"
  ON public.etapas_investigacao FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Somente autenticados podem deletar etapas"
  ON public.etapas_investigacao FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);
