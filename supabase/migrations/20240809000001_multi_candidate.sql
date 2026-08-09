-- Multi-candidate support for auto-apply platform

ALTER TABLE candidate_profile
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS ativo boolean default true,
  ADD COLUMN IF NOT EXISTS smtp_host text default 'smtp.gmail.com',
  ADD COLUMN IF NOT EXISTS smtp_port integer default 465,
  ADD COLUMN IF NOT EXISTS smtp_username text,
  ADD COLUMN IF NOT EXISTS smtp_password text,
  ADD COLUMN IF NOT EXISTS email_remetente text,
  ADD COLUMN IF NOT EXISTS limite_diario integer default 15;

-- Ensure email unique per candidate
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'candidate_profile_email_key'
  ) THEN
    ALTER TABLE candidate_profile ADD CONSTRAINT candidate_profile_email_key UNIQUE (email);
  END IF;
END $$;

-- Allow one application per user per job
ALTER TABLE job_applications_log
  ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_log_external_job_id_key'
  ) THEN
    ALTER TABLE job_applications_log DROP CONSTRAINT job_applications_log_external_job_id_key;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_log_external_job_id_user_id_key'
  ) THEN
    ALTER TABLE job_applications_log ADD CONSTRAINT job_applications_log_external_job_id_user_id_key UNIQUE (external_job_id, user_id);
  END IF;
END $$;
