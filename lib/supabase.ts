import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type Database = any;

function getSupabaseUrlAndKey() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase URL/anon key em falta");
  return { url, key, ref: new URL(url).hostname.split(".")[0] };
}

export function createClient() {
  const { url, key, ref } = getSupabaseUrlAndKey();
  return createSupabaseClient(url, key, { auth: { storageKey: `sb-${ref}-auth-token` } });
}
