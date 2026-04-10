CREATE POLICY "Somente autenticados podem deletar acidentes"
ON public.acidentes FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);