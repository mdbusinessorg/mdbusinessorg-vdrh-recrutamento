import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";
import ws from "ws";

export type Database = any;

const realtimeOptions = { transport: ws as any };

function getSupabaseUrlAndKey() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase URL/anon key em falta");
  return { url, key };
}

export function createServiceRoleClient() {
  const { url } = getSupabaseUrlAndKey();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY em falta");
  return createSupabaseClient(url, key, { auth: { persistSession: false }, realtime: realtimeOptions });
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const { url, key } = getSupabaseUrlAndKey();
  const cookieStore = cookies();

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // ignorar em páginas estáticas ou quando não é possível escrever cookies
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function isAdmin(user?: User | null): Promise<boolean> {
  if (!user?.email) return false;
  return user.email.trim().toLowerCase() === (process.env.MATIAS_EMAIL || "").trim().toLowerCase();
}
