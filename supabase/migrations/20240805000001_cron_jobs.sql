-- Configuração de cron segura: secrets lidos da tabela cron_config
-- O secret é gerido pelo Supabase Edge Function secrets e inserido em cron_config
-- após a criação desta tabela.

CREATE TABLE IF NOT EXISTS cron_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Função que invoca scrape-jobs com o secret correto
CREATE OR REPLACE FUNCTION public.cron_scrape_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret TEXT;
  response BIGINT;
BEGIN
  SELECT value INTO secret FROM public.cron_config WHERE key = 'cron_secret';
  IF secret IS NULL THEN
    RAISE NOTICE 'cron_secret não configurado; scrape-jobs não invocado';
    RETURN;
  END IF;

  response := net.http_post(
    'https://noywnuafpxvxvmfkjtbh.supabase.co/functions/v1/scrape-jobs',
    '{}'::jsonb,
    '{}'::jsonb,
    jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', secret
    ),
    120000
  );
END;
$$;

-- Função que invoca retry-pending-jobs com o secret correto
CREATE OR REPLACE FUNCTION public.cron_retry_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret TEXT;
  response BIGINT;
BEGIN
  SELECT value INTO secret FROM public.cron_config WHERE key = 'cron_secret';
  IF secret IS NULL THEN
    RAISE NOTICE 'cron_secret não configurado; retry-pending-jobs não invocado';
    RETURN;
  END IF;

  response := net.http_post(
    'https://noywnuafpxvxvmfkjtbh.supabase.co/functions/v1/retry-pending-jobs',
    '{}'::jsonb,
    '{}'::jsonb,
    jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', secret
    ),
    180000
  );
END;
$$;

-- Agenda horária (todos os dias, todas as horas)
SELECT cron.unschedule('scrape-jobs-hourly') FROM cron.job WHERE jobname = 'scrape-jobs-hourly';
SELECT cron.schedule('scrape-jobs-hourly', '0 * * * *', 'SELECT public.cron_scrape_jobs();');

-- scrape corre no início da hora; retry 15 minutos depois para dar tempo de inserir vagas
SELECT cron.unschedule('retry-pending-jobs-hourly') FROM cron.job WHERE jobname = 'retry-pending-jobs-hourly';
SELECT cron.schedule('retry-pending-jobs-hourly', '15 * * * *', 'SELECT public.cron_retry_jobs();');

-- Remove o job diário antigo do retry, já que agora corre de hora em hora
SELECT cron.unschedule('retry-pending-jobs-daily') FROM cron.job WHERE jobname = 'retry-pending-jobs-daily';
