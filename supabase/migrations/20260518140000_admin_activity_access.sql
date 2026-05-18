-- Admin read access for activity feed
CREATE POLICY "Admins can view all proposals"
  ON public.proposals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can view all submissions"
  ON public.submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.admin_recent_sign_ins(p_limit int DEFAULT 50)
RETURNS TABLE (user_id uuid, email text, last_sign_in_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, u.last_sign_in_at
  FROM auth.users u
  WHERE u.last_sign_in_at IS NOT NULL
  ORDER BY u.last_sign_in_at DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 100);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_recent_sign_ins(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_recent_sign_ins(int) TO authenticated;
