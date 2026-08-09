"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

const ALLOWED_EMAILS = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS || process.env.NEXT_PUBLIC_MATIAS_EMAIL || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function LoginGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "recovery">("login");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email.trim().toLowerCase())) {
      setMessage("Acesso reservado. Usa o email autorizado.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
        } else {
          window.location.href = "/admin/candidaturas";
        }
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Registo iniciado. Verifica o email para confirmar.");
        }
      } else {
        const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Link de recuperação enviado. Verifica o email.");
        }
      }
    } finally {
      setPending(false);
    }
  }

  const isRecovery = mode === "recovery";

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow p-8">
      <h1 className="text-2xl font-bold mb-2 text-brand-600">Acesso Privado</h1>
      <p className="text-sm text-slate-500 mb-6">Painel de Candidatura Automática — acesso autorizado.</p>
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
        {!isRecovery && (
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
        )}
        <button
          disabled={pending}
          type="submit"
          className="w-full rounded-lg bg-brand-600 text-white font-semibold py-2.5 hover:bg-brand-500 disabled:opacity-60"
        >
          {pending ? "Aguardar..." : isRecovery ? "Recuperar password" : mode === "login" ? "Entrar" : "Registar"}
        </button>
        {message && (
          <p className={`text-sm p-2 rounded ${message.includes("enviado") || message.includes("Registo iniciado") ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
            {message}
          </p>
        )}
      </form>
      <div className="mt-4 flex flex-col items-center gap-2">
        {isRecovery ? (
          <button onClick={() => setMode("login")} className="text-sm text-brand-600 hover:underline">
            Voltar ao login
          </button>
        ) : (
          <>
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-brand-600 hover:underline"
            >
              {mode === "login" ? "Criar conta" : "Já tenho conta"}
            </button>
            <button onClick={() => setMode("recovery")} className="text-sm text-slate-500 hover:underline">
              Esqueci-me da password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
