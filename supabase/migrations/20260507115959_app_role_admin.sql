-- Separate migration: adding enum values can require its own commit on some Postgres setups.
-- Grant admin: INSERT INTO public.user_roles (user_id, role) VALUES ('<auth.users.uuid>', 'admin'::public.app_role);
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
