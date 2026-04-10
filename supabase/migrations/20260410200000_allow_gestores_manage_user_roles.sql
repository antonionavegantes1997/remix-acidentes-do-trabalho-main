-- Allow gestores to manage user_roles like admins
DROP POLICY "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins and Gestores can manage user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));