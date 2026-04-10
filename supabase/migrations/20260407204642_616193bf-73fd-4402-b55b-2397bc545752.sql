
-- Add per-stage responsavel columns to etapas_investigacao
ALTER TABLE public.etapas_investigacao
  ADD COLUMN IF NOT EXISTS responsavel_etapa1 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsavel_etapa2 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsavel_etapa3 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsavel_etapa4 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsavel_etapa5 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsavel_etapa6 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsavel_etapa7 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsavel_etapa8 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsavel_etapa9 text NOT NULL DEFAULT '';

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'gestor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: admins can manage all roles, users can see their own
CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Audit log for acidentes modifications
CREATE TABLE public.acidentes_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acidente_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_email text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT 'update',
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.acidentes_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view audit log"
  ON public.acidentes_audit_log FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert audit log"
  ON public.acidentes_audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
