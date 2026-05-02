-- Roles enum
CREATE TYPE public.app_role AS ENUM ('student', 'business');
CREATE TYPE public.project_status AS ENUM ('open', 'in_progress', 'completed');
CREATE TYPE public.proposal_status AS ENUM ('pending', 'accepted', 'rejected');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  -- Student fields
  name TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  portfolio_links TEXT[] DEFAULT '{}',
  -- Business fields
  company_name TEXT,
  industry TEXT,
  company_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separate table to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Business projects
CREATE TABLE public.business_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  budget NUMERIC NOT NULL,
  deadline DATE,
  category TEXT,
  status project_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student portfolio projects
CREATE TABLE public.student_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  project_url TEXT,
  skills TEXT[] DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Proposals
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  timeline TEXT NOT NULL,
  status proposal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, student_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- user_roles policies (read-only for users; insertion happens via signup trigger)
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can view roles"
  ON public.user_roles FOR SELECT TO authenticated USING (true);

-- Business projects policies
CREATE POLICY "Authenticated can view all business projects"
  ON public.business_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Businesses can create projects"
  ON public.business_projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = business_id AND public.has_role(auth.uid(), 'business'));
CREATE POLICY "Owner can update business projects"
  ON public.business_projects FOR UPDATE TO authenticated USING (auth.uid() = business_id);
CREATE POLICY "Owner can delete business projects"
  ON public.business_projects FOR DELETE TO authenticated USING (auth.uid() = business_id);

-- Student projects policies
CREATE POLICY "Authenticated can view all student projects"
  ON public.student_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can create portfolio items"
  ON public.student_projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
CREATE POLICY "Owner can update portfolio items"
  ON public.student_projects FOR UPDATE TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Owner can delete portfolio items"
  ON public.student_projects FOR DELETE TO authenticated USING (auth.uid() = student_id);

-- Proposals policies
CREATE POLICY "Students view own proposals"
  ON public.proposals FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Businesses view proposals on their projects"
  ON public.proposals FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.business_projects bp WHERE bp.id = project_id AND bp.business_id = auth.uid()));
CREATE POLICY "Students can create proposals"
  ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
CREATE POLICY "Businesses can update proposal status"
  ON public.proposals FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.business_projects bp WHERE bp.id = project_id AND bp.business_id = auth.uid()));
CREATE POLICY "Students can delete own proposals"
  ON public.proposals FOR DELETE TO authenticated USING (auth.uid() = student_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER bp_updated BEFORE UPDATE ON public.business_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER sp_updated BEFORE UPDATE ON public.student_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER prop_updated BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile + role on signup using metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_role app_role;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student')::app_role;

  INSERT INTO public.profiles (id, email, name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'company_name'
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();