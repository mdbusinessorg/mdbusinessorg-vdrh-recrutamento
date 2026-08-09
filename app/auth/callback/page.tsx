"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("A processar...");

  useEffect(() => {
    const supabase = createClient();
    const url = new URL(window.location.href);
    const type = url.searchParams.get("type") || "";
    const next = url.searchParams.get("next") || "/admin/candidaturas";

    async function handle() {
      const code = url.searchParams.get("code");

      // PKCE / magic-link / recovery token passed as ?code=...
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(`Erro: ${error.message}`);
          setTimeout(() => (window.location.href = "/"), 2000);
          return;
        }
        window.location.href = type === "recovery" ? "/reset-password" : next;
        return;
      }

      // Implicit grant flow: access_token / refresh_token in URL fragment
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setMessage(`Erro: ${error.message}`);
          setTimeout(() => (window.location.href = "/"), 2000);
          return;
        }
        window.location.href = type === "recovery" ? "/reset-password" : next;
        return;
      }

      setMessage("Link inválido ou expirado.");
      setTimeout(() => (window.location.href = "/"), 2000);
    }

    handle();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-brand-600 mb-2">Acesso</h1>
        <p className="text-slate-600">{message}</p>
      </div>
    </main>
  );
}
