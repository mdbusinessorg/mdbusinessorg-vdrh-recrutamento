import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
      <h1 className="text-4xl font-bold mb-4">MÔ SALO — Candidatura Automática</h1>
      <p className="mb-8 text-white/90 max-w-lg text-center">
        Módulo privado de auto-candidatura. Acede ao painel de administrador para gerir o perfil, CVs, configurações e histórico.
      </p>
      <Link
        href="/admin/candidaturas"
        className="rounded-lg bg-white text-brand-600 px-6 py-3 font-semibold shadow hover:bg-slate-100 transition"
      >
        Abrir painel admin
      </Link>
    </main>
  );
}
