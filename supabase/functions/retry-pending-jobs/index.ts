import { serve } from "https://deno.land/std@0.217.0/http/server.ts";
import { getSupabaseClient, logApplication, processJob } from "../_shared/apply-logic.ts";

const FINAL_STATUSES = new Set(["enviado", "sem_email", "sem_match", "duplicado"]);
const MAX_BATCH = 8;
const DELAY_MS = 15000;

serve(async (req) => {
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (cronSecret) {
      const provided = req.headers.get("x-cron-secret") || "";
      if (provided !== cronSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
    }

    const supabase = getSupabaseClient();

    const { data: settings } = await supabase
      .from("auto_apply_settings")
      .select("limite_diario, ativo")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (!settings || !settings.ativo) {
      return new Response(JSON.stringify({ ok: true, message: "Módulo desactivado" }), { status: 200 });
    }

    const today = new Date().toISOString().split("T")[0];
    const { count: sentToday } = await supabase
      .from("job_applications_log")
      .select("id", { count: "exact", head: true })
      .eq("status", "enviado")
      .gte("created_at", `${today}T00:00:00Z`)
      .lt("created_at", `${today}T23:59:59Z`);

    const remaining = Math.max(0, settings.limite_diario - (sentToday || 0));
    if (remaining <= 0) {
      return new Response(JSON.stringify({ ok: true, message: "Limite diário atingido" }), { status: 200 });
    }

    // Processa vagas pendentes (sem log) ou com último log em erro, excluindo estados finais.
    const { data: jobs } = await supabase.from("external_jobs").select("id");
    const { data: logs } = await supabase
      .from("job_applications_log")
      .select("external_job_id, status, created_at")
      .order("created_at", { ascending: false });

    const latestByJob = new Map<string, string>();
    for (const log of logs || []) {
      if (!log.external_job_id) continue;
      if (!latestByJob.has(log.external_job_id)) {
        latestByJob.set(log.external_job_id, log.status);
      }
    }

    const pending = (jobs || []).filter((j) => {
      const latest = latestByJob.get(j.id);
      return !latest || !FINAL_STATUSES.has(latest);
    }).slice(0, Math.min(remaining, MAX_BATCH));

    // Limpa logs de erro anteriores para permitir reprocessamento
    const pendingIds = pending.map((j) => j.id);
    if (pendingIds.length > 0) {
      await supabase.from("job_applications_log").delete().in("external_job_id", pendingIds).eq("status", "erro");
    }

    const results: { job_id: string; status: string; error?: string }[] = [];
    for (let i = 0; i < pending.length; i++) {
      const job = pending[i];
      if (i > 0) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
      try {
        await processJob(supabase, job.id);
        results.push({ job_id: job.id, status: "ok" });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`Retry falhou para ${job.id}:`, msg);
        try {
          await logApplication(supabase, {
            external_job_id: job.id,
            status: "erro",
            erro_detalhe: msg,
          });
        } catch (logErr) {
          console.error("Falha ao registar erro no retry:", logErr);
        }
        results.push({ job_id: job.id, status: "error", error: msg });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), { status: 200 });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("retry-pending-jobs error:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
});
