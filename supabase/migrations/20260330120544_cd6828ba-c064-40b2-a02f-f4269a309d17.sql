ALTER TABLE public.acidentes 
  ADD COLUMN sexo text NOT NULL DEFAULT '',
  ADD COLUMN dia_semana text NOT NULL DEFAULT '',
  ADD COLUMN status_acidente text NOT NULL DEFAULT '',
  ADD COLUMN data_retorno date;

ALTER TABLE public.acidentes DROP COLUMN condicao_colaborador;