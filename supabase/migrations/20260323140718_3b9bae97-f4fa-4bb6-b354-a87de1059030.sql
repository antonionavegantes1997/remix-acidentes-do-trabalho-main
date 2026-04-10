
DROP POLICY "Somente autenticados podem inserir acidentes" ON public.acidentes;
DROP POLICY "Somente autenticados podem atualizar acidentes" ON public.acidentes;

CREATE POLICY "Somente autenticados podem inserir acidentes"
ON public.acidentes FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Somente autenticados podem atualizar acidentes"
ON public.acidentes FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
