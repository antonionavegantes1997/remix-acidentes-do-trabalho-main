
-- Add new columns
ALTER TABLE public.acidentes ADD COLUMN origem_fonte text NOT NULL DEFAULT '';
ALTER TABLE public.acidentes ADD COLUMN id_comunica_seguranca_eqtl text NOT NULL DEFAULT '';
ALTER TABLE public.acidentes ADD COLUMN transito_responsabilidades text NOT NULL DEFAULT '';
ALTER TABLE public.acidentes ADD COLUMN parte_corpo_atingida text NOT NULL DEFAULT '';
ALTER TABLE public.acidentes ADD COLUMN subdivisao_parte_corpo text NOT NULL DEFAULT '';

-- Move tipo data to tipo_evento where tipo_evento is empty
UPDATE public.acidentes SET tipo_evento = tipo WHERE tipo_evento = '' OR tipo_evento IS NULL;

-- Drop the tipo column
ALTER TABLE public.acidentes DROP COLUMN tipo;
