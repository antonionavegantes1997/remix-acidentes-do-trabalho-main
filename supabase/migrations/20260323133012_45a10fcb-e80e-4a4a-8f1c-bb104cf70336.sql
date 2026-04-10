
-- Create tipo_acidente enum
CREATE TYPE public.tipo_acidente AS ENUM ('Típico', 'Trajeto', 'Sinistro de Trânsito', 'Primeiros Socorros');

-- Create situacao_acidente enum
CREATE TYPE public.situacao_acidente AS ENUM ('Ativo', 'Finalizado');

-- Create acidentes table
CREATE TABLE public.acidentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapa INTEGER NOT NULL,
  nome TEXT NOT NULL,
  rateio TEXT NOT NULL,
  data DATE NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  dias_afastamento INTEGER NOT NULL DEFAULT 0,
  numero_cat TEXT NOT NULL DEFAULT '',
  tipo tipo_acidente NOT NULL,
  situacao situacao_acidente NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.acidentes ENABLE ROW LEVEL SECURITY;

-- Allow public read access (no auth yet)
CREATE POLICY "Allow public read access" ON public.acidentes
  FOR SELECT USING (true);

-- Allow public insert access (no auth yet)
CREATE POLICY "Allow public insert access" ON public.acidentes
  FOR INSERT WITH CHECK (true);

-- Allow public update access (no auth yet)
CREATE POLICY "Allow public update access" ON public.acidentes
  FOR UPDATE USING (true) WITH CHECK (true);
