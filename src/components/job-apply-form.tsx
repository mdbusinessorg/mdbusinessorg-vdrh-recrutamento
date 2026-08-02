'use client';

import { useState } from 'react';
import { Upload, Send, Loader2, CheckCircle } from 'lucide-react';
import { Job } from '@/data/site';

export function JobApplyForm({ job }: { job: Job }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-green-50 p-6 text-center dark:bg-green-900/20">
        <CheckCircle className="mx-auto h-10 w-10 text-green-600 dark:text-green-400" />
        <h3 className="mt-4 font-semibold text-green-800 dark:text-green-200">
          Candidatura enviada!
        </h3>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          Analisaremos o teu perfil para {job.title} e entraremos em contacto em breve.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Nome completo
        </label>
        <input
          required
          type="text"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="Ex: Ana Silva"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          E-mail
        </label>
        <input
          required
          type="email"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="ana@email.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Telefone
        </label>
        <input
          required
          type="tel"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="+244 923 000 000"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Carta de motivação / mensagem
        </label>
        <textarea
          required
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="Conta-nos porque és o candidato ideal..."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Currículo (PDF)
        </label>
        <div className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 transition hover:border-vdrh-500 dark:border-slate-700 dark:bg-slate-800/50">
          <Upload className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Arrasta ou clique para anexar
          </span>
          <input type="file" accept=".pdf" className="hidden" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A enviar...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" /> Enviar candidatura
          </>
        )}
      </button>
    </form>
  );
}
