-- Webhook: dispara process-new-job em cada INSERT em external_jobs
-- Cron: retry-pending-jobs diariamente às 08:00 UTC

-- pg_net já deve estar activo; garantimos a extensão
-- (a extensão pg_cron já foi criada na migration inicial)

-- Função wrapper para o retry diário
CREATE OR REPLACE FUNCTION public.cron_retry_pending_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response bigint;
BEGIN
  response := net.http_post(
    'https://noywnuafpxvxvmfkjtbh.supabase.co/functions/v1/retry-pending-jobs',
    '{}'::jsonb,
    '{}'::jsonb,
    '{"Content-Type":"application/json"}'::jsonb,
    30000
  );
END;
$$;

-- Trigger sobre external_jobs
CREATE OR REPLACE FUNCTION public.trigger_process_new_job()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    'https://noywnuafpxvxvmfkjtbh.supabase.co/functions/v1/process-new-job',
    jsonb_build_object('id', NEW.id),
    '{}'::jsonb,
    '{"Content-Type":"application/json"}'::jsonb,
    30000
  );
  RETURN NEW;
END;
$$;

-- Remover trigger automático para evitar concorrência Groq; scraper/retry processam em sequência
DROP TRIGGER IF EXISTS external_jobs_insert_webhook ON public.external_jobs;

-- Agenda o retry diario (remove antigo se existir)
SELECT cron.unschedule('retry-pending-jobs-daily') FROM cron.job WHERE jobname = 'retry-pending-jobs-daily';
SELECT cron.schedule('retry-pending-jobs-daily', '0 8 * * *', 'SELECT public.cron_retry_pending_jobs();');

-- Scraper horario do AngolaEmprego
SELECT cron.unschedule('scrape-jobs-hourly') FROM cron.job WHERE jobname = 'scrape-jobs-hourly';
SELECT cron.schedule('scrape-jobs-hourly', '0 * * * *', 'SELECT net.http_post(''https://noywnuafpxvxvmfkjtbh.supabase.co/functions/v1/scrape-jobs'', NULL, ''{"Content-Type":"application/json"}''::jsonb, 60000);');
