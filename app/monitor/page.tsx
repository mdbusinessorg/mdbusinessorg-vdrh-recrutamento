import { getAuthenticatedUser, isAdmin } from "@/lib/supabase-server";
import { LoginGate } from "@/components/LoginGate";
import { RobotMonitor } from "@/components/RobotMonitor";

export const metadata = {
  title: "Central de Comando — Candidatura Automática",
};

export default async function MonitorPage() {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <LoginGate />
      </div>
    );
  }

  return <RobotMonitor />;
}
