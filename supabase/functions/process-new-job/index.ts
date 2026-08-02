import { serve } from "https://deno.land/std@0.217.0/http/server.ts";
import { getSupabaseClient, processJob } from "../_shared/apply-logic.ts";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método não suportado" }), { status: 405 });
    }

    const body = await req.json().catch(() => ({}));
    const record = body.record || body;
    const jobId = record.id;

    if (!jobId) {
      return new Response(JSON.stringify({ error: "ID da vaga em falta" }), { status: 400 });
    }

    const supabase = getSupabaseClient();
    await processJob(supabase, jobId);

    return new Response(JSON.stringify({ ok: true, job_id: jobId }), { status: 200 });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("process-new-job error:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
});
