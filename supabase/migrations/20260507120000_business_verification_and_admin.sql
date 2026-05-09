-- Admin role value added in 20260507115959_app_role_admin.sql

CREATE TYPE public.business_company_type AS ENUM ('private_company', 'public_company');

CREATE TYPE public.business_verification_status AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'rejected'
);

CREATE TYPE public.business_verification_doc_type AS ENUM (
  'registration_certificate',
  'tax_registration',
  'proof_of_address',
  'incorporation',
  'directors_info',
  'audited_financial'
);

CREATE TABLE public.business_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  company_type public.business_company_type NOT NULL DEFAULT 'private_company',
  status public.business_verification_status NOT NULL DEFAULT 'draft',
  tax_id_number TEXT,
  registration_number TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.business_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.business_verifications (id) ON DELETE CASCADE,
  doc_type public.business_verification_doc_type NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (verification_id, doc_type)
);

CREATE INDEX idx_business_verifications_user_id ON public.business_verifications (user_id);
CREATE INDEX idx_business_verifications_status ON public.business_verifications (status);

CREATE TRIGGER business_verifications_updated
  BEFORE UPDATE ON public.business_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- True when user has an approved verification row
CREATE OR REPLACE FUNCTION public.business_verification_is_approved (_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_verifications v
    WHERE v.user_id = _user_id
      AND v.status = 'approved'
  );
$$;

-- Block privilege escalation via signup metadata: only student or business from trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role public.app_role;
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'business' THEN
    user_role := 'business'::public.app_role;
  ELSE
    user_role := 'student'::public.app_role;
  END IF;

  INSERT INTO public.profiles (id, email, name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'company_name'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;

ALTER TABLE public.business_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_verification_documents ENABLE ROW LEVEL SECURITY;

-- business_verifications policies
CREATE POLICY "Users and admins can view business verifications"
  ON public.business_verifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "Businesses can create own verification record"
  ON public.business_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'business'::public.app_role)
  );

CREATE POLICY "Businesses update own draft or rejected verification"
  ON public.business_verifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status IN ('draft', 'rejected')
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status IN ('draft', 'rejected', 'pending_review')
  );

CREATE POLICY "Admins update any business verification"
  ON public.business_verifications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- business_verification_documents policies
CREATE POLICY "View docs for own verification or admin"
  ON public.business_verification_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.business_verifications bv
      WHERE bv.id = verification_id
        AND (
          bv.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::public.app_role)
        )
    )
  );

CREATE POLICY "Business inserts docs in editable verification"
  ON public.business_verification_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.business_verifications bv
      WHERE bv.id = verification_id
        AND bv.user_id = auth.uid()
        AND bv.status IN ('draft', 'rejected')
    )
  );

CREATE POLICY "Business updates docs in editable verification"
  ON public.business_verification_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.business_verifications bv
      WHERE bv.id = verification_id
        AND bv.user_id = auth.uid()
        AND bv.status IN ('draft', 'rejected')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.business_verifications bv
      WHERE bv.id = verification_id
        AND bv.user_id = auth.uid()
        AND bv.status IN ('draft', 'rejected')
    )
  );

CREATE POLICY "Business deletes docs in editable verification"
  ON public.business_verification_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.business_verifications bv
      WHERE bv.id = verification_id
        AND bv.user_id = auth.uid()
        AND bv.status IN ('draft', 'rejected')
    )
  );

-- Only approved businesses may create new projects
DROP POLICY IF EXISTS "Businesses can create projects" ON public.business_projects;

CREATE POLICY "Verified businesses can create projects"
  ON public.business_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = business_id
    AND public.has_role(auth.uid(), 'business'::public.app_role)
    AND public.business_verification_is_approved(auth.uid())
  );

-- Grandfather existing business accounts as approved (no KYC backlog for current users)
INSERT INTO public.business_verifications (
  user_id,
  company_type,
  status,
  submitted_at,
  reviewed_at
)
SELECT
  ur.user_id,
  'private_company'::public.business_company_type,
  'approved'::public.business_verification_status,
  now(),
  now()
FROM public.user_roles ur
WHERE ur.role = 'business'::public.app_role
ON CONFLICT (user_id) DO NOTHING;

-- Private bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-verification', 'business-verification', false);

CREATE POLICY "Business verification files: business uploads own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-verification'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.has_role(auth.uid(), 'business'::public.app_role)
  );

CREATE POLICY "Business verification files: owner or admin can read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'business-verification'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

CREATE POLICY "Business verification files: owner can update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'business-verification'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Business verification files: owner can delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-verification'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
