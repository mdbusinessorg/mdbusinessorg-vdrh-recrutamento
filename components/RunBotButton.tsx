"use client";

import { useState } from "react";

export function RunBotButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function runBot() {
    if (!confirm("Correr o bot agora? Isto vai procurar novas vagas e enviar candidaturas imediatamente.")) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/run-bot", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Bot executado. ${data.message || ""}`);
      } else {
        setMessage(`Erro: ${data.error || "Falha ao correr o bot"}`);
      }
    } catch (e) {
      setMessage("Erro de rede ao correr o bot");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={runBot}
        disabled={loading}
        className={`text-sm px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-60 transition ${className}`}
      >
        {loading ? "A correr..." : "Correr Bot Agora"}
      </button>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
