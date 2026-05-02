
-- Add documentation_url to business_projects
ALTER TABLE public.business_projects
ADD COLUMN documentation_url text;

-- Storage bucket for project documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', true);

-- Storage policies: businesses upload to their own folder, everyone can read
CREATE POLICY "Project documents are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-documents');

CREATE POLICY "Businesses can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.has_role(auth.uid(), 'business'::app_role)
);

CREATE POLICY "Owners can update their project documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners can delete their project documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL,
  reviewee_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reviewer_id, project_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Validation trigger: only allow review when project is completed and reviewer is involved
CREATE OR REPLACE FUNCTION public.validate_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proj_status project_status;
  proj_business uuid;
  has_accepted boolean;
BEGIN
  SELECT status, business_id INTO proj_status, proj_business
  FROM public.business_projects WHERE id = NEW.project_id;

  IF proj_status IS DISTINCT FROM 'completed' THEN
    RAISE EXCEPTION 'Reviews can only be left for completed projects';
  END IF;

  IF NEW.reviewer_id = NEW.reviewee_id THEN
    RAISE EXCEPTION 'You cannot review yourself';
  END IF;

  -- Reviewer must be either the business owner or a student with an accepted proposal
  IF NEW.reviewer_id = proj_business THEN
    -- business reviewing the student: reviewee must be the accepted student
    SELECT EXISTS (
      SELECT 1 FROM public.proposals
      WHERE project_id = NEW.project_id
        AND status = 'accepted'
        AND student_id = NEW.reviewee_id
    ) INTO has_accepted;
    IF NOT has_accepted THEN
      RAISE EXCEPTION 'Reviewee must be the accepted student on this project';
    END IF;
  ELSE
    -- student reviewing the business: reviewer must have accepted proposal, reviewee must be business owner
    SELECT EXISTS (
      SELECT 1 FROM public.proposals
      WHERE project_id = NEW.project_id
        AND status = 'accepted'
        AND student_id = NEW.reviewer_id
    ) INTO has_accepted;
    IF NOT has_accepted THEN
      RAISE EXCEPTION 'Only the accepted student can review this project';
    END IF;
    IF NEW.reviewee_id <> proj_business THEN
      RAISE EXCEPTION 'Reviewee must be the project owner';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_validate_before_insert
BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review();

CREATE TRIGGER reviews_set_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS policies
CREATE POLICY "Reviews are viewable by authenticated users"
ON public.reviews FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can delete their own reviews"
ON public.reviews FOR DELETE
TO authenticated
USING (auth.uid() = reviewer_id);

CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_project ON public.reviews(project_id);
