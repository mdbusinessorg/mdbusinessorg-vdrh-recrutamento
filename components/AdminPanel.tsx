"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveProfile, saveSettings } from "@/app/admin/candidaturas/actions";
import { SubmitButton } from "./SubmitButton";

function toCSV(arr: string[] = []) {
  return arr.join(", ");
}

function toArray(str: string) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AdminPanel({
  user,
  profile,
  cvs,
  settings,
  logs,
  status,
}: {
  user: any;
  profile: any;
  cvs: any[];
  settings: any;
  logs: any[];
  status: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profileForm, setProfileForm] = useState({
    id: profile?.id || "",
    full_name: profile?.full_name || "",
    bio_longa: profile?.bio_longa || "",
    formacao: profile?.formacao || "",
    certificacoes: toCSV(profile?.certificacoes),
    skills: toCSV(profile?.skills),
    referencias: toCSV(profile?.referencias?.map((r: any) => r.nome || r)),
  });

  const [settingsForm, setSettingsForm] = useState({
    ativo: settings?.ativo ?? true,
    score_minimo: settings?.score_minimo ?? 55,
    limite_diario: settings?.limite_diario ?? 15,
    email_remetente: settings?.email_remetente || "suporte@mosalo.eu.cc",
  });

  async function handleProfile(formData: FormData) {
    formData.set("certificacoes", JSON.stringify(toArray(profileForm.certificacoes)));
    formData.set("skills", JSON.stringify(toArray(profileForm.skills)));
    formData.set(
      "referencias",
      JSON.stringify(
        toArray(profileForm.referencias).map((nome) => ({
          nome,
          cargo: "",
          empresa: "",
          contacto: "",
        }))
      )
    );
    const result = await saveProfile(formData);
    if (result.error) alert(result.error);
    else router.refresh();
  }

  async function handleCV(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("skills_cobertas", JSON.stringify(toArray(String(formData.get("skills_cobertas")))));
    const res = await fetch("/api/cvs", { method: "POST", body: formData });
    const result = await res.json();
    if (!res.ok) alert(result.error || "Erro");
    else {
      form.reset();
      router.refresh();
    }
  }

  async function handleDeleteCV(id: string) {
    if (!confirm("Eliminar CV?")) return;
    const res = await fetch("/api/cvs", { method: "DELETE", body: JSON.stringify({ id }) });
    const result = await res.json();
    if (!res.ok) alert(result.error || "Erro");
    else router.refresh();
  }

  async function handleSettings(formData: FormData) {
    const result = await saveSettings(formData);
    if (result.error) alert(result.error);
    else router.refresh();
  }

  function setStatusFilter(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("status", next);
    else params.delete("status");
    router.push(`/admin/candidaturas?${params.toString()}`);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-600">Painel de Candidatura Automática</h1>
          <p className="text-slate-500 text-sm">{user.email}</p>
        </div>
        <div className="text-sm text-slate-500">
          Módulo {settingsForm.ativo ? <span className="text-green-600 font-medium">ACTIVO</span> : <span className="text-red-600 font-medium">INACTIVO</span>}
        </div>
      </header>

      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Perfil do Matias</h2>
        <form action={handleProfile} className="space-y-4">
          <input type="hidden" name="id" value={profileForm.id} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome completo</label>
              <input
                name="full_name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Formação</label>
              <input
                name="formacao"
                value={profileForm.formacao}
                onChange={(e) => setProfileForm({ ...profileForm, formacao: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio / Percurso completo</label>
            <textarea
              name="bio_longa"
              value={profileForm.bio_longa}
              onChange={(e) => setProfileForm({ ...profileForm, bio_longa: e.target.value })}
              required
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Certificações (separadas por vírgula)</label>
              <input
                value={profileForm.certificacoes}
                onChange={(e) => setProfileForm({ ...profileForm, certificacoes: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skills (separadas por vírgula)</label>
              <input
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referências (nomes, separados por vírgula)</label>
              <input
                value={profileForm.referencias}
                onChange={(e) => setProfileForm({ ...profileForm, referencias: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
          <SubmitButton label="Guardar perfil" />
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">CVs</h2>
        <form onSubmit={handleCV} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input name="titulo" placeholder="CV Rigger" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cargo-alvo</label>
            <input name="cargo_alvo" placeholder="Rigger" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skills cobertas (CSV)</label>
            <input name="skills_cobertas" placeholder="Rigger, SIPP, Banksman" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PDF</label>
            <input name="file" type="file" accept="application/pdf" required className="w-full text-sm" />
          </div>
          <div className="md:col-span-4 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input name="ativo" type="checkbox" defaultChecked className="rounded" />
              Activo
            </label>
            <SubmitButton label="Adicionar CV" />
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-2">Título</th>
                <th className="text-left p-2">Cargo-alvo</th>
                <th className="text-left p-2">Skills</th>
                <th className="text-left p-2">Activo</th>
                <th className="text-left p-2"></th>
              </tr>
            </thead>
            <tbody>
              {cvs.map((cv) => (
                <tr key={cv.id} className="border-b">
                  <td className="p-2">{cv.titulo}</td>
                  <td className="p-2">{cv.cargo_alvo}</td>
                  <td className="p-2">{(cv.skills_cobertas || []).join(", ")}</td>
                  <td className="p-2">{cv.ativo ? "Sim" : "Não"}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDeleteCV(cv.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Configurações</h2>
        <form action={handleSettings} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Score mínimo</label>
            <input
              name="score_minimo"
              type="number"
              defaultValue={settingsForm.score_minimo}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Limite diário</label>
            <input
              name="limite_diario"
              type="number"
              defaultValue={settingsForm.limite_diario}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email remetente</label>
            <input
              name="email_remetente"
              defaultValue={settingsForm.email_remetente}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input name="ativo" type="checkbox" defaultChecked={settingsForm.ativo} className="rounded" />
              Módulo activo
            </label>
            <SubmitButton label="Guardar" />
          </div>
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Histórico de candidaturas</h2>
          <select
            value={status}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="enviado">Enviado</option>
            <option value="sem_email">Sem email</option>
            <option value="sem_match">Sem match</option>
            <option value="erro">Erro</option>
            <option value="duplicado">Duplicado</option>
          </select>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 sticky top-0">
              <tr>
                <th className="text-left p-2">Data</th>
                <th className="text-left p-2">Vaga</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Score</th>
                <th className="text-left p-2">Destino</th>
                <th className="text-left p-2">Assunto</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-2 whitespace-nowrap">{new Date(log.created_at).toLocaleString("pt-PT")}</td>
                  <td className="p-2">{log.external_jobs?.title || log.external_job_id}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(log.status)}`}>{log.status}</span>
                  </td>
                  <td className="p-2">{log.score_match ?? "-"}</td>
                  <td className="p-2">{log.email_destino || "-"}</td>
                  <td className="p-2 max-w-xs truncate" title={log.assunto_email || ""}>{log.assunto_email || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "enviado":
      return "bg-green-100 text-green-700";
    case "sem_email":
      return "bg-yellow-100 text-yellow-700";
    case "sem_match":
      return "bg-slate-100 text-slate-600";
    case "erro":
      return "bg-red-100 text-red-700";
    case "duplicado":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
