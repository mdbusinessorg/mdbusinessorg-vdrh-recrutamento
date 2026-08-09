import { NextResponse } from "next/server";
import { createServiceRoleClient, getAuthenticatedUser, isAdmin } from "@/lib/supabase-server";

export const revalidate = 0;

export const runtime = "nodejs";

async function getCronSecret(): Promise<string | null> {
  const envSecret = process.env.CRON_SECRET;
  if (envSecret) return envSecret;
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("cron_config").select("value").eq("key", "cron_secret").single();
  return data?.value || null;
}

async function invokeFunction(name: string, secret: string, body?: object) {
  const url = `https://noywnuafpxvxvmfkjtbh.supabase.co/functions/v1/${name}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cron-secret": secret,
    },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, body: json };
}

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !(await isAdmin(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = await getCronSecret();
    if (!secret) {
      return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
    }

    const scrape = await invokeFunction("scrape-jobs", secret, { manual: true });
    const retry = await invokeFunction("retry-pending-jobs", secret, { manual: true });

    return NextResponse.json({
      ok: true,
      scrape,
      retry,
      message: "Bot executado. Verifica /monitor ou /vagas para ver os resultados.",
    });
  } catch (e: any) {
    console.error("run-bot error:", e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
