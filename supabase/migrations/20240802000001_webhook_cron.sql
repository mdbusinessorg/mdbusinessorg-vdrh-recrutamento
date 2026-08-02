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

DROP TRIGGER IF EXISTS external_jobs_insert_webhook ON public.external_jobs;
CREATE TRIGGER external_jobs_insert_webhook
  AFTER INSERT ON public.external_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_process_new_job();

-- Agenda o retry diario (remove antigo se existir)
SELECT cron.unschedule('retry-pending-jobs-daily') FROM cron.job WHERE jobname = 'retry-pending-jobs-daily';
SELECT cron.schedule('retry-pending-jobs-daily', '0 8 * * *', 'SELECT public.cron_retry_pending_jobs();');
