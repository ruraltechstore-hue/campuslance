
-- Invite status enum
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'rejected');

-- Invites table
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE,
  business_id uuid NOT NULL,
  student_id uuid NOT NULL,
  status public.invite_status NOT NULL DEFAULT 'pending',
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, student_id)
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business can create invites for own projects"
ON public.invites FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = business_id
  AND public.has_role(auth.uid(), 'business')
  AND public.has_role(student_id, 'student')
  AND EXISTS (
    SELECT 1 FROM public.business_projects bp
    WHERE bp.id = project_id AND bp.business_id = auth.uid()
  )
);

CREATE POLICY "Business can view own invites"
ON public.invites FOR SELECT TO authenticated
USING (auth.uid() = business_id);

CREATE POLICY "Student can view own invites"
ON public.invites FOR SELECT TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Business can delete own pending invites"
ON public.invites FOR DELETE TO authenticated
USING (auth.uid() = business_id AND status = 'pending');

CREATE POLICY "Student can update own invite status"
ON public.invites FOR UPDATE TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

CREATE TRIGGER trg_invites_updated_at
BEFORE UPDATE ON public.invites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- When a student accepts an invite, auto-assign the project
CREATE OR REPLACE FUNCTION public.handle_invite_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    -- Insert or upgrade a proposal as accepted
    INSERT INTO public.proposals (project_id, student_id, message, timeline, status)
    VALUES (NEW.project_id, NEW.student_id, COALESCE(NEW.message, 'Accepted via invite'), 'TBD', 'accepted')
    ON CONFLICT DO NOTHING;

    UPDATE public.proposals
    SET status = 'accepted'
    WHERE project_id = NEW.project_id AND student_id = NEW.student_id;

    -- Reject other pending proposals
    UPDATE public.proposals
    SET status = 'rejected'
    WHERE project_id = NEW.project_id
      AND student_id <> NEW.student_id
      AND status = 'pending';

    -- Move project to in_progress
    UPDATE public.business_projects
    SET status = 'in_progress'
    WHERE id = NEW.project_id AND status = 'open';

    -- Reject other pending invites for this project
    UPDATE public.invites
    SET status = 'rejected'
    WHERE project_id = NEW.project_id
      AND id <> NEW.id
      AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invite_accept
AFTER UPDATE ON public.invites
FOR EACH ROW EXECUTE FUNCTION public.handle_invite_accept();
