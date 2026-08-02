"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase";

const MATIAS_EMAIL = (process.env.NEXT_PUBLIC_MATIAS_EMAIL || "").toLowerCase();

export function LoginGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (MATIAS_EMAIL && email.toLowerCase() !== MATIAS_EMAIL) {
      setMessage("Acesso reservado ao Matias. Usa o email autorizado.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setMessage(error ? error.message : "");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        setMessage(
          error
            ? error.message
            : "Registo iniciado. Verifica o email para confirmar (ou desactiva confirmação por email nas settings do Supabase)."
        );
      }
      if (!message) window.location.reload();
    });
  }

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow p-8">
      <h1 className="text-2xl font-bold mb-2 text-brand-600">Acesso Privado</h1>
      <p className="text-sm text-slate-500 mb-6">Painel de Candidatura Automática — apenas o Matias.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          disabled={pending}
          type="submit"
          className="w-full rounded-lg bg-brand-600 text-white font-semibold py-2.5 hover:bg-brand-500 disabled:opacity-60"
        >
          {pending ? "Aguardar..." : mode === "login" ? "Entrar" : "Registar"}
        </button>
        {message && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{message}</p>}
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-sm text-brand-600 hover:underline"
        >
          {mode === "login" ? "Criar conta" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}
