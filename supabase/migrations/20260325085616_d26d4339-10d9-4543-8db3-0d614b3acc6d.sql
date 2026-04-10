-- Add new columns to acidentes table
ALTER TABLE public.acidentes
  ADD COLUMN contrato text NOT NULL DEFAULT '',
  ADD COLUMN hora time,
  ADD COLUMN municipio text NOT NULL DEFAULT '',
  ADD COLUMN zona text NOT NULL DEFAULT '',
  ADD COLUMN tipo_evento text NOT NULL DEFAULT '',
  ADD COLUMN natureza_acidente text NOT NULL DEFAULT '',
  ADD COLUMN placa_veiculo text NOT NULL DEFAULT '';

-- Create horas_treinamento table
CREATE TABLE public.horas_treinamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes text NOT NULL,
  contrato text NOT NULL,
  quantidade integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.horas_treinamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Somente autenticados podem ver treinamentos"
ON public.horas_treinamento FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Somente autenticados podem inserir treinamentos"
ON public.horas_treinamento FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Somente autenticados podem atualizar treinamentos"
ON public.horas_treinamento FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);