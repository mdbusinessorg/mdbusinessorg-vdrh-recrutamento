import { serve } from "https://deno.land/std@0.217.0/http/server.ts";
import {
  getSupabaseClient,
  logApplication,
  processCandidateJob,
  getActiveProfiles,
  getProfileByUserId,
  getSettings,
  getJob,
  checkDailyLimit,
} from "../_shared/apply-logic.ts";

const DEFAULT_MAX_BATCH = 8;
const DEFAULT_DELAY_MS = 15000;

serve(async (req) => {
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (cronSecret) {
      const provided = req.headers.get("x-cron-secret") || "";
      if (provided !== cronSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
    }

    let manual = false;
    let userId: string | undefined;
    let maxBatch = DEFAULT_MAX_BATCH;
    try {
      const body = await req.json();
      manual = !!body.manual;
      userId = body.user_id;
      if (body.max_batch && typeof body.max_batch === "number") maxBatch = body.max_batch;
    } catch {
      // body pode estar vazio
    }

    const delayMs = manual ? 0 : DEFAULT_DELAY_MS;
    const supabase = getSupabaseClient();

    const settings = await getSettings(supabase);
    if (!settings || !settings.ativo) {
      return new Response(JSON.stringify({ ok: true, message: "Módulo desactivado" }), { status: 200 });
    }



    let profiles = userId ? [await getProfileByUserId(supabase, userId)] : await getActiveProfiles(supabase);
    profiles = profiles.filter((p): p is NonNullable<typeof p> => !!p && p.ativo !== false);

    if (profiles.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "Nenhum candidato activo" }), { status: 200 });
    }

    // remove profiles already at daily limit
    for (let i = profiles.length - 1; i >= 0; i--) {
      const limit = profiles[i].limite_diario ?? settings.limite_diario;
      if (await checkDailyLimit(supabase, profiles[i].user_id, limit)) {
        console.log(`Limite diário atingido para ${profiles[i].full_name}.`);
        profiles.splice(i, 1);
      }
    }

    if (profiles.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "Todos os candidatos atingiram o limite diário" }), { status: 200 });
    }

    const { data: jobs } = await supabase.from("external_jobs").select("id");
    const allJobIds = (jobs || []).map((j) => j.id);

    // per-profile pending jobs
    const profileJobs: { profile: typeof profiles[0]; pendingIds: string[] }[] = [];
    for (const profile of profiles) {
      const { data: logs } = await supabase
        .from("job_applications_log")
        .select("external_job_id, status")
        .eq("user_id", profile.user_id);
      const processed = new Set((logs || []).map((l) => l.external_job_id));
      const pendingIds = allJobIds.filter((id) => !processed.has(id)).slice(0, maxBatch);
      profileJobs.push({ profile, pendingIds });
    }

    const results: { user_id: string; job_id: string; status: string; score?: number | null; error?: string }[] = [];
    let jobCount = 0;

    for (const { profile, pendingIds } of profileJobs) {
      const limit = profile.limite_diario ?? settings.limite_diario;
      for (let i = 0; i < pendingIds.length; i++) {
        if (await checkDailyLimit(supabase, profile.user_id, limit)) {
          console.log(`Limite diário atingido para ${profile.full_name} durante o processamento.`);
          break;
        }

        if (jobCount > 0 && delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
        jobCount++;

        const job = await getJob(supabase, pendingIds[i]);
        if (!job) continue;

        try {
          await processCandidateJob(supabase, job, profile, settings);
          results.push({ user_id: profile.user_id, job_id: pendingIds[i], status: "ok" });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error(`Retry falhou para ${pendingIds[i]} / ${profile.user_id}:`, msg);
          try {
            await logApplication(supabase, {
              external_job_id: pendingIds[i],
              user_id: profile.user_id,
              status: "erro",
              erro_detalhe: msg,
            });
          } catch (logErr) {
            console.error("Falha ao registar erro no retry:", logErr);
          }
          results.push({ user_id: profile.user_id, job_id: pendingIds[i], status: "error", error: msg });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), { status: 200 });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("retry-pending-jobs error:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
});
