ALTER TABLE public.acidentes 
  ADD COLUMN fatalidade text NOT NULL DEFAULT 'Não',
  ADD COLUMN condicao_colaborador text NOT NULL DEFAULT '';