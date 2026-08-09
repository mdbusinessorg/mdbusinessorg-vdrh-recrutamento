"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className={`text-sm px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition ${className}`}
    >
      Sair
    </button>
  );
}
