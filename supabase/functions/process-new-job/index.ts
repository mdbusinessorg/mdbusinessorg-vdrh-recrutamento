import { serve } from "https://deno.land/std@0.217.0/http/server.ts";
import { getSupabaseClient, logApplication, processJob } from "../_shared/apply-logic.ts";

serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret) {
    const provided = req.headers.get("x-cron-secret") || "";
    if (provided !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
  }

  let jobId: string | undefined;
  let supabase: ReturnType<typeof getSupabaseClient> | undefined;

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método não suportado" }), { status: 405 });
    }

    const body = await req.json().catch(() => ({}));
    const record = body.record || body;
    jobId = record.id;

    if (!jobId) {
      return new Response(JSON.stringify({ error: "ID da vaga em falta" }), { status: 400 });
    }

    supabase = getSupabaseClient();
    await processJob(supabase, jobId);

    return new Response(JSON.stringify({ ok: true, job_id: jobId }), { status: 200 });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("process-new-job error:", error);

    if (supabase && jobId) {
      try {
        await logApplication(supabase, {
          external_job_id: jobId,
          status: "erro",
          erro_detalhe: error,
        });
      } catch (logErr) {
        console.error("Falha ao registar erro:", logErr);
      }
    }

    return new Response(JSON.stringify({ error }), { status: 500 });
  }
});
