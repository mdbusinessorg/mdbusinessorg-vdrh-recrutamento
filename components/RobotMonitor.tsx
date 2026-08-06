"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface MonitorData {
  active: boolean;
  score_minimo: number;
  limite_diario: number;
  sent_today: number;
  found_today: number;
  pending: number;
  errors_today: number;
  totals: Record<string, number>;
  last_scraper: { source: string; last_run_at: string; jobs_found: number; jobs_inserted: number } | null;
  recent_jobs: {
    id: string;
    title: string | null;
    company: string | null;
    source: string | null;
    created_at: string;
    status: string;
    score: number | null;
  }[];
}

const statusLabel: Record<string, string> = {
  enviado: "Enviado",
  sem_email: "Sem email",
  sem_match: "Sem match",
  erro: "Erro",
  duplicado: "Duplicado",
  pendente: "Pendente",
};

const statusColor: Record<string, string> = {
  enviado: "bg-green-500/20 text-green-300 border-green-500/40",
  sem_email: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  sem_match: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  erro: "bg-red-500/20 text-red-300 border-red-500/40",
  duplicado: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  pendente: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
};

const flow = [
  { id: "scrape", label: "Scraper", icon: "🌐", desc: "Busca vagas no AngolaEmprego/RSS" },
  { id: "queue", label: "Fila", icon: "📥", desc: "Vagas novas entram na fila" },
  { id: "ai", label: "IA Groq", icon: "🧠", desc: "Compara CV com a vaga e escolhe skills" },
  { id: "email", label: "Email", icon: "✉️", desc: "Envia candidatura com CV anexo" },
  { id: "log", label: "Log", icon: "📝", desc: "Regista tudo para auditoria" },
];

export function RobotMonitor() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  async function load() {
    try {
      const res = await fetch("/api/monitor", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(clock);
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-cyan-400 text-lg">A inicializar sistema...</div>
      </div>
    );
  }

  const lastRunText = data.last_scraper
    ? new Date(data.last_scraper.last_run_at).toLocaleString("pt-PT")
    : "—";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 to-slate-900/90 p-6 md:p-10">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="relative h-40 w-40 md:h-52 md:w-52 flex-shrink-0">
              <Image
                src="/jarvis-robot.png"
                alt="Robô assistente"
                fill
                className="object-contain drop-shadow-[0_0_25px_rgba(26,86,255,0.6)]"
                priority
              />
              <div className="absolute inset-0 rounded-full animate-pulse bg-cyan-400/10" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-brand-300 to-purple-300 bg-clip-text text-transparent">
                Central de Comando
              </h1>
              <p className="text-slate-400 mt-2">Sistema de Candidatura Automática</p>
              <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                <span
                  className={`inline-flex h-3 w-3 rounded-full animate-ping ${
                    data.active ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <span className={`font-semibold ${data.active ? "text-green-300" : "text-red-300"}`}>
                  {data.active ? "ROBÔ ACTIVO" : "ROBÔ INACTIVO"}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 text-sm">Actualizado: {now.toLocaleTimeString("pt-PT")}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value={data.found_today} label="Vagas hoje" color="cyan" />
          <StatCard value={data.sent_today} label="Candidaturas hoje" color="green" suffix={`/ ${data.limite_diario}`} />
          <StatCard value={data.pending} label="Pendentes / Erros" color="yellow" />
          <StatCard value={data.errors_today} label="Erros hoje" color="red" />
        </section>

        {/* Flow diagram */}
        <section className="rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-cyan-300 mb-6">Pipeline do Robô</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {flow.map((step, idx) => (
              <div key={step.id} className="flex items-center w-full md:w-auto">
                <div className="group relative flex-1 md:flex-none">
                  <div className="rounded-2xl border border-indigo-500/30 bg-slate-950/80 p-4 text-center hover:border-cyan-400/60 transition-colors">
                    <div className="text-3xl mb-2">{step.icon}</div>
                    <div className="font-semibold text-slate-200">{step.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{step.desc}</div>
                    <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {idx < flow.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-5 w-8 border-t-2 border-dashed border-indigo-500/40" />
                  )}
                </div>
                {idx < flow.length - 1 && (
                  <div className="md:hidden h-8 w-0.5 bg-indigo-500/40 my-2 mx-auto" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Scraper status + totals */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Últimas vagas processadas</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="p-2">Hora</th>
                    <th className="p-2">Vaga</th>
                    <th className="p-2">Fonte</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_jobs.map((job) => (
                    <tr key={job.id} className="border-b border-slate-800/50 hover:bg-slate-800/40">
                      <td className="p-2 whitespace-nowrap text-slate-400">
                        {new Date(job.created_at).toLocaleTimeString("pt-PT")}
                      </td>
                      <td className="p-2 max-w-xs truncate" title={job.title || ""}>
                        {job.title || "—"}
                      </td>
                      <td className="p-2 text-slate-400">{job.source || "—"}</td>
                      <td className="p-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                            statusColor[job.status] || statusColor.pendente
                          }`}
                        >
                          {statusLabel[job.status] || job.status}
                        </span>
                      </td>
                      <td className="p-2">{job.score ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Estado do Scraper</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Última corrida</span>
                  <span className="text-slate-100">{lastRunText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fonte</span>
                  <span className="text-slate-100">{data.last_scraper?.source || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vagas encontradas</span>
                  <span className="text-slate-100">{data.last_scraper?.jobs_found ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vagas inseridas</span>
                  <span className="text-slate-100">{data.last_scraper?.jobs_inserted ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Totais</h2>
              <div className="space-y-2">
                {Object.entries(data.totals).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{statusLabel[status] || status}</span>
                    <span className="font-semibold text-slate-100">{count}</span>
                  </div>
                ))}
                {!Object.keys(data.totals).length && (
                  <p className="text-slate-500 text-sm">Sem histórico ainda.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-2">Limites</h2>
              <p className="text-sm text-slate-400">
                Score mínimo: <span className="text-slate-100 font-medium">{data.score_minimo}</span>
              </p>
              <p className="text-sm text-slate-400">
                Candidaturas/dia: <span className="text-slate-100 font-medium">{data.limite_diario}</span>
              </p>
              <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-brand-500"
                  style={{ width: `${Math.min(100, (data.sent_today / Math.max(1, data.limite_diario)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {data.sent_today} de {data.limite_diario} enviadas hoje
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ value, label, color, suffix }: { value: number; label: string; color: string; suffix?: string }) {
  const gradients: Record<string, string> = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
    green: "from-green-500/20 to-green-500/5 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
    red: "from-red-500/20 to-red-500/5 border-red-500/30",
  };
  const text: Record<string, string> = {
    cyan: "text-cyan-300",
    green: "text-green-300",
    yellow: "text-yellow-300",
    red: "text-red-300",
  };
  return (
    <div className={`rounded-2xl border p-5 bg-gradient-to-br ${gradients[color]}`}>
      <div className={`text-3xl md:text-4xl font-bold ${text[color]}`}>
        {value}
        {suffix && <span className="text-lg text-slate-500 font-normal">{suffix}</span>}
      </div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}
