import { serve } from "https://deno.land/std@0.217.0/http/server.ts";
import { getSupabaseClient } from "../_shared/apply-logic.ts";

const BASE_URL = "https://angolaemprego.com/vagas";
const DEFAULT_QUERIES = ["rigger", "offshore", "Banksman"];
const MAX_JOBS_PER_RUN = 5;
const PROCESS_DELAY_MS = 10000;
const USER_AGENT = "Mozilla/5.0 (compatible; MosaloAutoApply/1.0)";

async function triggerProcessJob(jobId: string) {
  const baseUrl = Deno.env.get("SUPABASE_URL");
  if (!baseUrl) return;
  try {
    await fetch(`${baseUrl}/functions/v1/process-new-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: jobId }),
    });
  } catch (e) {
    console.warn(`Falha ao invocar process-new-job para ${jobId}:`, e);
  }
}

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
      // AngolaEmprego inclui novas linhas literais no JSON-LD; limpamos control chars
      const sanitized = script.replace(/[\x00-\x1F]/g, " ");
      const data = JSON.parse(sanitized);
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
  return items;
}

function parseJobDetail(html: string): JobPosting | null {
  return parseJsonLd<JobPosting>(html, "JobPosting");
}

function cleanEmail(raw?: string): string | null {
  if (!raw) return null;
  const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const matches = raw.match(regex);
  if (!matches) return null;
  for (const match of matches) {
    const cleaned = match.replace(/(\.[A-Za-z]{2,6})[A-Za-z0-9_]+$/, "$1");
    if (/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(cleaned)) return cleaned;
  }
  return null;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchListing(query: string, page = 1): Promise<ListingItem[]> {
  const url = query
    ? `${BASE_URL}?q=${encodeURIComponent(query)}&page=${page}`
    : `${BASE_URL}?page=${page}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    console.warn(`Falha ao aceder ${url}: ${res.status}`);
    return [];
  }
  const html = await res.text();
  return parseListing(html);
}

function getQueries(): string[] {
  const env = Deno.env.get("SCRAPE_QUERIES");
  if (!env) return DEFAULT_QUERIES;
  return env.split(",").map((s) => s.trim()).filter(Boolean);
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

    const queries = getQueries();
    const seen = new Set<string>();
    const listings: ListingItem[] = [];

    for (const query of queries) {
      for (let page = 1; page <= 2; page++) {
        if (listings.length >= MAX_JOBS_PER_RUN) break;
        const items = await fetchListing(query, page);
        for (const item of items) {
          if (!item.url || seen.has(item.url)) continue;
          seen.add(item.url);
          listings.push(item);
          if (listings.length >= MAX_JOBS_PER_RUN) break;
        }
      }
      if (listings.length >= MAX_JOBS_PER_RUN) break;
    }

    const results: { url: string; title: string; status: string }[] = [];
    let insertedCount = 0;

    for (const item of listings) {
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
        const pageText = htmlToText(detailHtml);
        const contactEmail = cleanEmail(description) || cleanEmail(pageText);

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

        const { data: inserted, error } = await supabase.from("external_jobs").insert(payload).select("id").single();
        if (error || !inserted) {
          results.push({ url: item.url, title: payload.title, status: `erro DB: ${error?.message || "sem id"}` });
        } else {
          insertedCount++;
          results.push({ url: item.url, title: payload.title, status: "inserido" });
          await triggerProcessJob(inserted.id);
          await new Promise((r) => setTimeout(r, PROCESS_DELAY_MS));
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
