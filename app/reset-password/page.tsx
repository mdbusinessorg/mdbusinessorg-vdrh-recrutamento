"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password !== confirm) {
      setMessage("As passwords não coincidem.");
      return;
    }
    if (password.length < 6) {
      setMessage("A password deve ter pelo menos 6 caracteres.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Password actualizada. A redireccionar...");
        setTimeout(() => {
          window.location.href = "/admin/candidaturas";
        }, 1500);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-2 text-brand-600">Nova password</h1>
        <p className="text-sm text-slate-500 mb-6">Define uma nova password para o painel.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nova password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirmar password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            disabled={pending}
            type="submit"
            className="w-full rounded-lg bg-brand-600 text-white font-semibold py-2.5 hover:bg-brand-500 disabled:opacity-60"
          >
            {pending ? "Aguardar..." : "Definir nova password"}
          </button>
          {message && (
            <p className={`text-sm p-2 rounded ${message.includes("actualizada") || message.includes("redireccionar") ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
