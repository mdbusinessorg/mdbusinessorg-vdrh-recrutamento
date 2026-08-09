-- Trigger para processar novas vagas automaticamente ao INSERT

CREATE OR REPLACE FUNCTION public.handle_new_job()
RETURNS TRIGGER AS $$
DECLARE
  secret text;
BEGIN
  SELECT value INTO secret FROM public.cron_config WHERE key = 'cron_secret';

  PERFORM net.http_post(
    url := 'https://noywnuafpxvxvmfkjtbh.supabase.co/functions/v1/process-new-job',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', COALESCE(secret, '')
    ),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_new_job ON public.external_jobs;
CREATE TRIGGER trg_new_job
AFTER INSERT ON public.external_jobs
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_job();
