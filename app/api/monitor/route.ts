import { NextResponse } from "next/server";
import { createServiceRoleClient, getAuthenticatedUser, isAdmin } from "@/lib/supabase-server";

export const revalidate = 0;

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const today = new Date().toISOString().split("T")[0];
  const todayStart = `${today}T00:00:00Z`;
  const todayEnd = `${today}T23:59:59Z`;

  const [settingsRes, sentTodayRes, foundTodayRes, pendingRes, errorsTodayRes, lastScraperRes, recentJobsRes] = await Promise.all([
    supabase.from("auto_apply_settings").select("*").order("id", { ascending: false }).limit(1).single(),
    supabase.from("job_applications_log").select("id", { count: "exact", head: true }).eq("status", "enviado").gte("created_at", todayStart).lt("created_at", todayEnd),
    supabase.from("external_jobs").select("id", { count: "exact", head: true }).gte("created_at", todayStart).lt("created_at", todayEnd),
    supabase.from("job_applications_log").select("id", { count: "exact", head: true }).eq("status", "erro"),
    supabase.from("job_applications_log").select("id", { count: "exact", head: true }).eq("status", "erro").gte("created_at", todayStart).lt("created_at", todayEnd),
    supabase.from("scraper_state").select("*").order("last_run_at", { ascending: false }).limit(1).single(),
    supabase
      .from("external_jobs")
      .select("*, job_applications_log(status, score_match, created_at)")
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<any[]>(),
  ]);

  const logsRes = await supabase
    .from("job_applications_log")
    .select("status")
    .returns<{ status: string }[]>();

  const totals = (logsRes.data || []).reduce(
    (acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const recent = (recentJobsRes.data || []).map((job: any) => {
    const log = job.job_applications_log;
    const status = log?.status || "pendente";
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      source: job.source,
      created_at: job.created_at,
      status,
      score: log?.score_match ?? null,
    };
  });

  return NextResponse.json({
    active: settingsRes.data?.ativo ?? false,
    score_minimo: settingsRes.data?.score_minimo ?? 55,
    limite_diario: settingsRes.data?.limite_diario ?? 15,
    sent_today: sentTodayRes.count || 0,
    found_today: foundTodayRes.count || 0,
    pending: pendingRes.count || 0,
    errors_today: errorsTodayRes.count || 0,
    totals,
    last_scraper: lastScraperRes.data || null,
    recent_jobs: recent,
  });
}
