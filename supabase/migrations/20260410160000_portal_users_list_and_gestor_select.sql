-- Gestores podem ver a lista de vínculos (somente leitura na UI; INSERT/UPDATE/DELETE seguem restritos a admin)
CREATE POLICY "Gestors can view all user_roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'));

-- Lista usuários do portal com e-mail (apenas admin ou gestor autenticados)
CREATE OR REPLACE FUNCTION public.list_portal_users_with_email()
RETURNS TABLE (
  role_row_id uuid,
  user_id uuid,
  email text,
  display_name text,
  role public.app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor')) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT
    ur.id,
    ur.user_id,
    au.email::text,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      split_part(au.email::text, '@', 1)
    ),
    ur.role
  FROM public.user_roles ur
  INNER JOIN auth.users au ON au.id = ur.user_id
  ORDER BY au.email;
END;
$$;

REVOKE ALL ON FUNCTION public.list_portal_users_with_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_portal_users_with_email() TO authenticated;
