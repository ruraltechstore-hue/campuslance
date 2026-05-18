-- Allow businesses to post projects without approved verification.
-- Verification remains for profile trust / company badge (business_verification_is_approved).

DROP POLICY IF EXISTS "Verified businesses can create projects" ON public.business_projects;

CREATE POLICY "Businesses can create projects"
  ON public.business_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = business_id
    AND public.has_role(auth.uid(), 'business'::public.app_role)
  );
