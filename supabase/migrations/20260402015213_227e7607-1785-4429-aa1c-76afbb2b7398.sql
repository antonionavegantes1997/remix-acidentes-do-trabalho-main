
-- Convert tipo from enum to text
ALTER TABLE public.acidentes ALTER COLUMN tipo TYPE text USING tipo::text;

-- Add new columns to match CSV structure
ALTER TABLE public.acidentes
  ADD COLUMN IF NOT EXISTS nome_empresa text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cargo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS idade integer,
  ADD COLUMN IF NOT EXISTS escolaridade text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tempo_empresa text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tempo_funcao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS regional text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS turno_trabalho text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS horas_trabalhadas text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tipologia_acidente text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS afastamento text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS dias_perdidos integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dias_debitados integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gravidade_lesao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS identificacao_lesao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gravidade_acidente text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tarefa_executada text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS acoes_imediatas text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS causas_basicas_tasc text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS causas_imediatas_tasc text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS nome_gestor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS nome_responsavel text NOT NULL DEFAULT '';
