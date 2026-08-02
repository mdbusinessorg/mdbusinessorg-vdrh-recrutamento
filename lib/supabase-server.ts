import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import ws from "ws";

export type Database = any;

const realtimeOptions = { transport: ws as any };

function getSupabaseUrlAndKey() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase URL/anon key em falta");
  return { url, key, ref: new URL(url).hostname.split(".")[0] };
}

export function createServiceRoleClient() {
  const { url } = getSupabaseUrlAndKey();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY em falta");
  return createSupabaseClient(url, key, { auth: { persistSession: false }, realtime: realtimeOptions });
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const { url, key, ref } = getSupabaseUrlAndKey();
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get(`sb-${ref}-auth-token`);
  if (!tokenCookie?.value) return null;

  let accessToken: string | null = null;
  try {
    const parsed = JSON.parse(tokenCookie.value);
    accessToken = parsed?.access_token || null;
  } catch {
    accessToken = tokenCookie.value;
  }
  if (!accessToken) return null;

  const supabase = createSupabaseClient(url, key, { realtime: realtimeOptions });
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

export async function isAdmin(user?: User | null): Promise<boolean> {
  if (!user?.email) return false;
  return user.email.toLowerCase() === (process.env.MATIAS_EMAIL || "").toLowerCase();
}
