import { createBrowserClient } from "@supabase/ssr";

export type Database = any;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase URL/anon key em falta");
  return createBrowserClient<Database>(url, key);
}
