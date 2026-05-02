
-- Add 'submitted' to project_status enum
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'submitted' BEFORE 'completed';

-- Submission status enum
DO $$ BEGIN
  CREATE TYPE public.submission_status AS ENUM ('submitted', 'revision_requested', 'approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  file_url TEXT,
  project_url TEXT,
  message TEXT NOT NULL DEFAULT '',
  status public.submission_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_project ON public.submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Helper: is auth user the assigned (accepted) student on this project?
CREATE OR REPLACE FUNCTION public.is_assigned_student(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.proposals
    WHERE project_id = _project_id AND student_id = _user_id AND status = 'accepted'
  )
$$;

-- Helper: is auth user the owning business on this project?
CREATE OR REPLACE FUNCTION public.is_project_business(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_projects
    WHERE id = _project_id AND business_id = _user_id
  )
$$;

-- RLS Policies
CREATE POLICY "Student can insert own submission"
ON public.submissions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND public.is_assigned_student(project_id, auth.uid())
);

CREATE POLICY "Student can view own submissions"
ON public.submissions FOR SELECT TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Business can view submissions on own projects"
ON public.submissions FOR SELECT TO authenticated
USING (public.is_project_business(project_id, auth.uid()));

CREATE POLICY "Student can update own submission on revision"
ON public.submissions FOR UPDATE TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Business can update submission status"
ON public.submissions FOR UPDATE TO authenticated
USING (public.is_project_business(project_id, auth.uid()))
WITH CHECK (public.is_project_business(project_id, auth.uid()));

-- Trigger: sync project status with submission status
CREATE OR REPLACE FUNCTION public.handle_submission_status()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.business_projects SET status = 'submitted'
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'submitted' THEN
      UPDATE public.business_projects SET status = 'submitted' WHERE id = NEW.project_id;
    ELSIF NEW.status = 'revision_requested' THEN
      UPDATE public.business_projects SET status = 'in_progress' WHERE id = NEW.project_id;
    ELSIF NEW.status = 'approved' THEN
      UPDATE public.business_projects SET status = 'completed' WHERE id = NEW.project_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS submissions_status_sync ON public.submissions;
CREATE TRIGGER submissions_status_sync
AFTER INSERT OR UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.handle_submission_status();

DROP TRIGGER IF EXISTS submissions_updated_at ON public.submissions;
CREATE TRIGGER submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for submissions (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-submissions', 'project-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: path format = {project_id}/{student_id}/filename.zip
CREATE POLICY "Student can upload own submission file"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-submissions'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Student can read own submission file"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'project-submissions'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Business can read submissions on own projects"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'project-submissions'
  AND public.is_project_business(
    ((storage.foldername(name))[1])::uuid,
    auth.uid()
  )
);

CREATE POLICY "Student can update own submission file"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'project-submissions'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
