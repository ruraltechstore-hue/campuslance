-- Auto-update project status to 'in_progress' when a proposal is accepted
CREATE OR REPLACE FUNCTION public.handle_proposal_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    UPDATE public.business_projects
    SET status = 'in_progress'
    WHERE id = NEW.project_id
      AND status = 'open';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_proposal_accepted ON public.proposals;
CREATE TRIGGER on_proposal_accepted
AFTER UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.handle_proposal_accepted();

-- Backfill: any project with an accepted proposal that is still 'open' moves to 'in_progress'
UPDATE public.business_projects bp
SET status = 'in_progress'
WHERE bp.status = 'open'
  AND EXISTS (
    SELECT 1 FROM public.proposals p
    WHERE p.project_id = bp.id AND p.status = 'accepted'
  );