-- Escrita restrita a administradores; gestores permanecem com SELECT nas políticas existentes

-- acidentes
DROP POLICY IF EXISTS "Somente autenticados podem inserir acidentes" ON public.acidentes;
DROP POLICY IF EXISTS "Somente autenticados podem atualizar acidentes" ON public.acidentes;
DROP POLICY IF EXISTS "Somente autenticados podem deletar acidentes" ON public.acidentes;

CREATE POLICY "Admins podem inserir acidentes"
  ON public.acidentes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar acidentes"
  ON public.acidentes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar acidentes"
  ON public.acidentes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- acoes
DROP POLICY IF EXISTS "Somente autenticados podem inserir acoes" ON public.acoes;
DROP POLICY IF EXISTS "Somente autenticados podem atualizar acoes" ON public.acoes;
DROP POLICY IF EXISTS "Somente autenticados podem deletar acoes" ON public.acoes;

CREATE POLICY "Admins podem inserir acoes"
  ON public.acoes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar acoes"
  ON public.acoes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar acoes"
  ON public.acoes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- acoes_anexos
DROP POLICY IF EXISTS "Somente autenticados podem inserir acoes_anexos" ON public.acoes_anexos;
DROP POLICY IF EXISTS "Somente autenticados podem deletar acoes_anexos" ON public.acoes_anexos;

CREATE POLICY "Admins podem inserir acoes_anexos"
  ON public.acoes_anexos FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar acoes_anexos"
  ON public.acoes_anexos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- etapas_investigacao
DROP POLICY IF EXISTS "Somente autenticados podem inserir etapas" ON public.etapas_investigacao;
DROP POLICY IF EXISTS "Somente autenticados podem atualizar etapas" ON public.etapas_investigacao;
DROP POLICY IF EXISTS "Somente autenticados podem deletar etapas" ON public.etapas_investigacao;

CREATE POLICY "Admins podem inserir etapas"
  ON public.etapas_investigacao FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar etapas"
  ON public.etapas_investigacao FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar etapas"
  ON public.etapas_investigacao FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- horas_treinamento
DROP POLICY IF EXISTS "Somente autenticados podem inserir treinamentos" ON public.horas_treinamento;
DROP POLICY IF EXISTS "Somente autenticados podem atualizar treinamentos" ON public.horas_treinamento;

CREATE POLICY "Admins podem inserir treinamentos"
  ON public.horas_treinamento FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar treinamentos"
  ON public.horas_treinamento FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage: anexos de ações
DROP POLICY IF EXISTS "Auth users can upload acoes files" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete acoes files" ON storage.objects;

CREATE POLICY "Admins podem upload acoes files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'acoes-anexos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem delete acoes files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'acoes-anexos' AND public.has_role(auth.uid(), 'admin'));
