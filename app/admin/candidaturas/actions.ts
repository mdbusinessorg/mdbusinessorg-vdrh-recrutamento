"use server";

import { createServiceRoleClient, getAuthenticatedUser, isAdmin } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function saveProfile(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) return { error: "Acesso negado" };

  const supabase = createServiceRoleClient();
  const id = formData.get("id") as string | null;
  const payload = {
    user_id: user.id,
    full_name: String(formData.get("full_name") || ""),
    bio_longa: String(formData.get("bio_longa") || ""),
    formacao: String(formData.get("formacao") || ""),
    certificacoes: JSON.parse(String(formData.get("certificacoes") || "[]")),
    skills: JSON.parse(String(formData.get("skills") || "[]")),
    referencias: JSON.parse(String(formData.get("referencias") || "[]")),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("candidate_profile").update(payload).eq("id", id)
    : await supabase.from("candidate_profile").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/admin/candidaturas");
  return { ok: true };
}

export async function saveSettings(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) return { error: "Acesso negado" };

  const supabase = createServiceRoleClient();
  const { data: settings } = await supabase
    .from("auto_apply_settings")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (!settings) return { error: "Configurações não encontradas" };

  const payload = {
    ativo: formData.get("ativo") === "on",
    score_minimo: Number(formData.get("score_minimo") || 55),
    limite_diario: Number(formData.get("limite_diario") || 15),
    email_remetente: String(formData.get("email_remetente") || ""),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("auto_apply_settings").update(payload).eq("id", settings.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/candidaturas");
  return { ok: true };
}
