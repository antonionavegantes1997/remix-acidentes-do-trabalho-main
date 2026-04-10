-- Permitir escrita para admin OU gestor (mantendo regras de usuários somente admin).
-- Esta migração sobrescreve as políticas "admin only" criadas anteriormente.

-- acidentes
DROP POLICY IF EXISTS "Admins podem inserir acidentes" ON public.acidentes;
DROP POLICY IF EXISTS "Admins podem atualizar acidentes" ON public.acidentes;
DROP POLICY IF EXISTS "Admins podem deletar acidentes" ON public.acidentes;

CREATE POLICY "Admins ou gestores podem inserir acidentes"
  ON public.acidentes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins ou gestores podem atualizar acidentes"
  ON public.acidentes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins ou gestores podem deletar acidentes"
  ON public.acidentes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- acoes
DROP POLICY IF EXISTS "Admins podem inserir acoes" ON public.acoes;
DROP POLICY IF EXISTS "Admins podem atualizar acoes" ON public.acoes;
DROP POLICY IF EXISTS "Admins podem deletar acoes" ON public.acoes;

CREATE POLICY "Admins ou gestores podem inserir acoes"
  ON public.acoes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins ou gestores podem atualizar acoes"
  ON public.acoes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins ou gestores podem deletar acoes"
  ON public.acoes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- acoes_anexos
DROP POLICY IF EXISTS "Admins podem inserir acoes_anexos" ON public.acoes_anexos;
DROP POLICY IF EXISTS "Admins podem deletar acoes_anexos" ON public.acoes_anexos;

CREATE POLICY "Admins ou gestores podem inserir acoes_anexos"
  ON public.acoes_anexos FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins ou gestores podem deletar acoes_anexos"
  ON public.acoes_anexos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- etapas_investigacao
DROP POLICY IF EXISTS "Admins podem inserir etapas" ON public.etapas_investigacao;
DROP POLICY IF EXISTS "Admins podem atualizar etapas" ON public.etapas_investigacao;
DROP POLICY IF EXISTS "Admins podem deletar etapas" ON public.etapas_investigacao;

CREATE POLICY "Admins ou gestores podem inserir etapas"
  ON public.etapas_investigacao FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins ou gestores podem atualizar etapas"
  ON public.etapas_investigacao FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins ou gestores podem deletar etapas"
  ON public.etapas_investigacao FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- horas_treinamento
DROP POLICY IF EXISTS "Admins podem inserir treinamentos" ON public.horas_treinamento;
DROP POLICY IF EXISTS "Admins podem atualizar treinamentos" ON public.horas_treinamento;

CREATE POLICY "Admins ou gestores podem inserir treinamentos"
  ON public.horas_treinamento FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins ou gestores podem atualizar treinamentos"
  ON public.horas_treinamento FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- Storage: anexos de ações
DROP POLICY IF EXISTS "Admins podem upload acoes files" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem delete acoes files" ON storage.objects;

CREATE POLICY "Admins ou gestores podem upload acoes files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'acoes-anexos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor')));

CREATE POLICY "Admins ou gestores podem delete acoes files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'acoes-anexos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor')));

