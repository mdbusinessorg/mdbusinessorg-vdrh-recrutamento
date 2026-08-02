import { createServiceRoleClient, getAuthenticatedUser, isAdmin } from "@/lib/supabase-server";
import { LoginGate } from "@/components/LoginGate";
import { AdminPanel } from "@/components/AdminPanel";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <LoginGate />
      </div>
    );
  }

  const supabase = createServiceRoleClient();
  const status = searchParams.status;

  const [profileRes, cvsRes, settingsRes, logsRes] = await Promise.all([
    supabase.from("candidate_profile").select("*").order("updated_at", { ascending: false }).limit(1).single(),
    supabase.from("candidate_cvs").select("*").order("created_at", { ascending: false }),
    supabase.from("auto_apply_settings").select("*").order("id", { ascending: false }).limit(1).single(),
    status
      ? supabase
          .from("job_applications_log")
          .select("*, external_jobs(title, company)")
          .eq("status", status)
          .order("created_at", { ascending: false })
          .limit(100)
      : supabase
          .from("job_applications_log")
          .select("*, external_jobs(title, company)")
          .order("created_at", { ascending: false })
          .limit(100),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminPanel
        user={user}
        profile={profileRes.data || null}
        cvs={cvsRes.data || []}
        settings={settingsRes.data || null}
        logs={logsRes.data || []}
        status={status || ""}
      />
    </main>
  );
}
