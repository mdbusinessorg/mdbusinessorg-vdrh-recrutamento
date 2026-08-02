import { serve } from "https://deno.land/std@0.217.0/http/server.ts";
import { getSupabaseClient, processJob } from "../_shared/apply-logic.ts";

serve(async (req) => {
  try {
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

    const { data: pending } = await supabase
      .from("external_jobs")
      .select("id")
      .not(
        "id",
        "in",
        `(select external_job_id from job_applications_log)`
      )
      .limit(remaining);

    const results: { job_id: string; status: string; error?: string }[] = [];
    for (const job of pending || []) {
      try {
        await processJob(supabase, job.id);
        results.push({ job_id: job.id, status: "ok" });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`Retry falhou para ${job.id}:`, msg);
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
