DROP POLICY "Somente autenticados podem ver acidentes" ON public.acidentes;

CREATE POLICY "Somente autenticados podem ver acidentes"
ON public.acidentes
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);