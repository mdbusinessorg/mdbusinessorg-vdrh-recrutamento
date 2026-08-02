import Link from "next/link";
import { getAuthenticatedUser, isAdmin, createServiceRoleClient } from "@/lib/supabase-server";
import { LoginGate } from "@/components/LoginGate";

interface JobApplicationLog {
  status: string;
  score_match: number | null;
  created_at: string | null;
}

interface ExternalJob {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  description: string | null;
  contact_info: string | null;
  url: string | null;
  source: string | null;
  created_at: string | null;
  updated_at: string | null;
  job_applications_log: JobApplicationLog | null;
}

const statusLabel: Record<string, string> = {
  enviado: "Candidatura enviada",
  sem_email: "Sem email de contacto",
  sem_match: "Score baixo",
  erro: "Erro",
  duplicado: "Duplicado",
};

const statusColor: Record<string, string> = {
  enviado: "bg-green-100 text-green-700",
  sem_email: "bg-yellow-100 text-yellow-700",
  sem_match: "bg-slate-100 text-slate-600",
  erro: "bg-red-100 text-red-700",
  duplicado: "bg-gray-100 text-gray-600",
};

export default async function VagasPage() {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <LoginGate />
      </div>
    );
  }

  const supabase = createServiceRoleClient();
  const { data: jobs } = await supabase
    .from("external_jobs")
    .select("*, job_applications_log(status, score_match, created_at)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<ExternalJob[]>();

  const { data: scraperRuns } = await supabase
    .from("scraper_state")
    .select("*")
    .order("last_run_at", { ascending: false })
    .limit(5)
    .returns<any[]>();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-600">Vagas Extraídas</h1>
          <Link href="/admin/candidaturas" className="text-sm text-brand-600 hover:underline">
            Ir para o painel admin
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-2">Últimas execuções do scraper</h2>
          {scraperRuns && scraperRuns.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {scraperRuns.map((run) => (
                <li key={run.id} className="flex gap-3">
                  <span className="text-slate-500">{new Date(run.last_run_at).toLocaleString("pt-PT")}</span>
                  <span className="font-medium">{run.source}</span>
                  <span className="text-slate-600">{run.jobs_inserted} inseridas / {run.jobs_found} encontradas</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Ainda não há registos do scraper.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left p-3 font-semibold">Vaga</th>
                  <th className="text-left p-3 font-semibold">Empresa</th>
                  <th className="text-left p-3 font-semibold">Localização</th>
                  <th className="text-left p-3 font-semibold">Estado</th>
                  <th className="text-left p-3 font-semibold">Score</th>
                  <th className="text-left p-3 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {(jobs || []).map((job) => {
                  const log = job.job_applications_log;
                  const status = log?.status || "pendente";
                  return (
                    <tr key={job.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <a href={job.url || "#"} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">
                          {job.title || "Sem título"}
                        </a>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{job.contact_info || "—"}</p>
                      </td>
                      <td className="p-3">{job.company || "—"}</td>
                      <td className="p-3">{job.location || "—"}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColor[status] || "bg-slate-100 text-slate-600"}`}>
                          {statusLabel[status] || status}
                        </span>
                      </td>
                      <td className="p-3">{log?.score_match ?? "—"}</td>
                      <td className="p-3">{job.created_at ? new Date(job.created_at).toLocaleDateString("pt-PT") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
