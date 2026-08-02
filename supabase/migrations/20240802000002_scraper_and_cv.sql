-- Suporte ao scraper e parsing de CVs

-- Evita vagas duplicadas vindas do scraper
ALTER TABLE external_jobs DROP CONSTRAINT IF EXISTS unique_external_jobs_url;
ALTER TABLE external_jobs ADD CONSTRAINT unique_external_jobs_url UNIQUE (url);

-- Texto extraído do PDF do CV para enriquecer o prompt e o perfil
ALTER TABLE candidate_cvs ADD COLUMN IF NOT EXISTS conteudo_texto text;

-- Estado do scraper (última corrida)
CREATE TABLE IF NOT EXISTS scraper_state (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  last_run_at timestamptz default now(),
  jobs_found integer default 0,
  jobs_inserted integer default 0,
  message text
);
