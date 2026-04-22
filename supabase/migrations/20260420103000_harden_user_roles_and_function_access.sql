-- Security hardening:
-- 1) only admins can mutate user_roles
-- 2) tighten execution grants for has_role helper

DROP POLICY IF EXISTS "Admins and Gestores can manage user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;

CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
