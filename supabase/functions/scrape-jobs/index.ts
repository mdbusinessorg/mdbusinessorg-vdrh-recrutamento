import { serve } from "https://deno.land/std@0.217.0/http/server.ts";
import { getSupabaseClient } from "../_shared/apply-logic.ts";

const LISTING_URL = "https://angolaemprego.com/vagas";
const MAX_JOBS_PER_RUN = 20;
const USER_AGENT = "Mozilla/5.0 (compatible; MosaloAutoApply/1.0)";

interface ListingItem {
  url: string;
  name?: string;
}

interface JobPosting {
  title?: string;
  description?: string;
  datePosted?: string;
  hiringOrganization?: { name?: string };
  jobLocation?: { address?: { addressLocality?: string } };
  identifier?: { value?: string };
}

function extractLdJsonScripts(html: string): string[] {
  const scripts: string[] = [];
  const regex = /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    scripts.push(match[1].trim());
  }
  return scripts;
}

function parseJsonLd<T>(html: string, typeName: string): T | null {
  for (const script of extractLdJsonScripts(html)) {
    try {
      const data = JSON.parse(script);
      if (data["@type"] === typeName) return data as T;
    } catch {
      // ignora JSON malformado
    }
  }
  return null;
}

function parseListing(html: string): ListingItem[] {
  const page = parseJsonLd<{ mainEntity?: { itemListElement?: ListingItem[] } }>(html, "CollectionPage");
  const items = page?.mainEntity?.itemListElement || [];
  return items.slice(0, MAX_JOBS_PER_RUN);
}

function parseJobDetail(html: string): JobPosting | null {
  return parseJsonLd<JobPosting>(html, "JobPosting");
}

function extractEmail(text?: string): string | null {
  if (!text) return null;
  const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const matches = text.match(regex);
  return matches ? matches[0] : null;
}

serve(async (req) => {
  try {
    if (req.method !== "POST" && req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Método não suportado" }), { status: 405 });
    }

    const supabase = getSupabaseClient();

    const { data: settings } = await supabase
      .from("auto_apply_settings")
      .select("ativo")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (!settings?.ativo) {
      return new Response(JSON.stringify({ ok: true, message: "Módulo desactivado" }), { status: 200 });
    }

    const listRes = await fetch(LISTING_URL, { headers: { "User-Agent": USER_AGENT } });
    if (!listRes.ok) throw new Error(`Falha ao aceder a ${LISTING_URL}: ${listRes.status}`);
    const listHtml = await listRes.text();
    const listings = parseListing(listHtml);

    const results: { url: string; title: string; status: string }[] = [];
    let insertedCount = 0;

    for (const item of listings) {
      if (!item.url) continue;

      try {
        const { count } = await supabase
          .from("external_jobs")
          .select("id", { count: "exact", head: true })
          .eq("url", item.url);

        if ((count ?? 0) > 0) {
          results.push({ url: item.url, title: item.name || "", status: "duplicado" });
          continue;
        }

        const detailRes = await fetch(item.url, { headers: { "User-Agent": USER_AGENT } });
        if (!detailRes.ok) {
          results.push({ url: item.url, title: item.name || "", status: `erro HTTP ${detailRes.status}` });
          continue;
        }

        const detailHtml = await detailRes.text();
        const job = parseJobDetail(detailHtml);

        if (!job) {
          results.push({ url: item.url, title: item.name || "", status: "sem JobPosting" });
          continue;
        }

        const description = job.description || "";
        const contactEmail = extractEmail(description);

        const payload = {
          title: job.title || item.name || "",
          company: job.hiringOrganization?.name || null,
          location: job.jobLocation?.address?.addressLocality || null,
          description,
          contact_info: contactEmail,
          requirements: "",
          url: item.url,
          source: "angolaemprego.com",
          raw_data: job,
        };

        const { error } = await supabase.from("external_jobs").insert(payload);
        if (error) {
          results.push({ url: item.url, title: payload.title, status: `erro DB: ${error.message}` });
        } else {
          insertedCount++;
          results.push({ url: item.url, title: payload.title, status: "inserido" });
        }
      } catch (itemError) {
        const msg = itemError instanceof Error ? itemError.message : String(itemError);
        results.push({ url: item.url, title: item.name || "", status: `erro: ${msg}` });
      }
    }

    await supabase.from("scraper_state").insert({
      source: "angolaemprego.com",
      jobs_found: listings.length,
      jobs_inserted: insertedCount,
      message: `Processadas ${results.length} vagas`,
    });

    return new Response(JSON.stringify({ ok: true, processed: results.length, inserted: insertedCount, jobs: results }), { status: 200 });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("scrape-jobs error:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
});
