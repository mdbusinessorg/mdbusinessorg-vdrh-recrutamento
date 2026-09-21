"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddCandidateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/add-candidate", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Candidato criado: ${data.email}.`);
        form.reset();
        router.refresh();
      } else {
        setMessage(`Erro: ${data.error || "Falha ao criar candidato"}`);
      }
    } catch (err) {
      setMessage("Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email do candidato</label>
          <input name="email" type="email" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password para o painel</label>
          <input name="password" type="text" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">App Password Gmail</label>
          <input name="smtp_password" type="text" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <p className="text-xs text-slate-500 mt-1">
            O candidato gera a password em{" "}
            <a
              href="https://myaccount.google.com/apppasswords"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 underline"
            >
              myaccount.google.com/apppasswords
            </a>{" "}
            (requer verificação em 2 passos activa).
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email remetente (opcional)</label>
          <input name="email_remetente" type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo (opcional)</label>
          <input name="full_name" type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cargo alvo (opcional)</label>
          <input name="cargo_alvo" type="text" placeholder="ex: HSE Supervisor / Civil Engineer" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CV (PDF)</label>
          <input name="file" type="file" accept="application/pdf" required className="w-full text-sm" />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-60 transition"
      >
        {loading ? "A criar..." : "Adicionar candidato"}
      </button>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </form>
  );
}
