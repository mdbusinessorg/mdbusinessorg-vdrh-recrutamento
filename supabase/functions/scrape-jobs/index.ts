import { serve } from "https://deno.land/std@0.217.0/http/server.ts";
import { getSupabaseClient, extractEmail } from "../_shared/apply-logic.ts";

const DEFAULT_QUERIES = ["rigger", "offshore", "Banksman", "maintenance technician", "slinger"];
const DEFAULT_MAX_JOBS_PER_RUN = 50;
const MANUAL_MAX_JOBS_PER_RUN = 10;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

interface ListingItem {
  url: string;
  name?: string;
  source: string;
}

interface JobPosting {
  title?: string;
  description?: string;
  datePosted?: string;
  hiringOrganization?: { name?: string };
  jobLocation?: { address?: { addressLocality?: string } };
  identifier?: { value?: string };
}

interface JobSource {
  name: string;
  // Páginas de listagem; {page} é substituído pelo número da página
  listingUrls: string[];
  // Regex que captura URLs de detalhe de vaga no HTML da listagem
  linkPattern: RegExp;
  // Número de páginas de listagem a varrer por fonte
  maxPages?: number;
  // Feed RSS com links de vagas (opcional)
  rssUrl?: string;
  // Se true, também procura vagas por query string (formato específico da fonte)
  searchUrl?: (query: string, page: number) => string;
}

const SOURCES: JobSource[] = [
  {
    name: "angolaemprego.com",
    listingUrls: ["https://angolaemprego.com/vagas?page={page}"],
    linkPattern: /https?:\/\/(?:www\.)?angolaemprego\.com\/vagas\/[^"'\s<]+/gi,
    rssUrl: "https://www.angolaemprego.com/feed",
    searchUrl: (q, p) => `https://angolaemprego.com/vagas?q=${encodeURIComponent(q)}&page=${p}`,
  },
  {
    name: "angoemprego.com",
    listingUrls: ["https://angoemprego.com/vagas/", "https://angoemprego.com/vagas/page/{page}/"],
    linkPattern: /https?:\/\/(?:www\.)?angoemprego\.com\/vagas\/[^"'\s<]+/gi,
    maxPages: 3,
  },
  {
    name: "empregosyoyota.net",
    listingUrls: ["https://ao.empregosyoyota.net/", "https://ao.empregosyoyota.net/empregos?page={page}"],
    linkPattern: /https?:\/\/ao\.empregosyoyota\.net\/empregos\/[^"'\s<]+/gi,
    maxPages: 3,
  },
  {
    name: "jobartis.com",
    listingUrls: ["https://www.jobartis.com/", "https://www.jobartis.com/vagas-emprego"],
    linkPattern: /https?:\/\/(?:www\.)?jobartis\.com\/emprego-jobartis-[^"'\s<]+/gi,
    maxPages: 1,
  },
];

function extractLdJsonScripts(html: string): string[] {
  const scripts: string[] = [];
  const regex = /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    scripts.push(match[1].trim());
  }
  return scripts;
}

function parseJsonLdAll<T>(html: string, typeName: string): T[] {
  const out: T[] = [];
  for (const script of extractLdJsonScripts(html)) {
    try {
      const sanitized = script.replace(/[\x00-\x1F]/g, " ");
      const data = JSON.parse(sanitized);
      const list = Array.isArray(data) ? data : [data];
      for (const d of list) {
        if (d && d["@type"] === typeName) out.push(d as T);
        if (d && d["@graph"]) {
          for (const g of d["@graph"]) {
            if (g && g["@type"] === typeName) out.push(g as T);
          }
        }
      }
    } catch {
      // ignora JSON malformado
    }
  }
  return out;
}

function parseJsonLd<T>(html: string, typeName: string): T | null {
  return parseJsonLdAll<T>(html, typeName)[0] || null;
}

function parseListing(html: string): ListingItem[] {
  const page = parseJsonLd<{ mainEntity?: { itemListElement?: ListingItem[] } }>(html, "CollectionPage");
  return page?.mainEntity?.itemListElement || [];
}

function parseJobDetail(html: string): JobPosting | null {
  return parseJsonLd<JobPosting>(html, "JobPosting");
}

function extractTitle(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1].trim();
  const t = html.match(/<title>([^<]+)<\/title>/i);
  if (t) return t[1].replace(/\s*[-|–].*$/, "").trim();
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return h1 ? htmlToText(h1[1]) : "";
}

function htmlToText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" } });
    if (!res.ok) {
      console.warn(`Falha ao aceder ${url}: ${res.status}`);
      return "";
    }
    return res.text();
  } catch (e) {
    console.warn(`Falha ao aceder ${url}:`, e);
    return "";
  }
}

async function fetchRssLinks(rssUrl: string, pathFilter: RegExp): Promise<string[]> {
  try {
    const xml = await fetchHtml(rssUrl);
    if (!xml) return [];
    const links: string[] = [];
    const itemRe = /<item>[\s\S]*?<\/item>/gi;
    let m;
    while ((m = itemRe.exec(xml)) !== null) {
      const linkMatch = m[0].match(/<link>([^<]+)<\/link>/i);
      if (linkMatch && pathFilter.test(linkMatch[1])) {
        links.push(linkMatch[1].trim());
      }
    }
    return links;
  } catch (e) {
    console.warn("Falha ao ler feed RSS:", e);
    return [];
  }
}

function extractLinks(html: string, pattern: RegExp, baseHost: string): string[] {
  const found = new Set<string>();
  // URLs absolutas no HTML
  for (const m of html.matchAll(pattern)) {
    let url = m[0].replace(/&amp;.*$/, "").replace(/[?#].*$/, "");
    if (!url.endsWith("/") && !url.includes(".")) url += "/";
    // exclui a própria página de listagem
    if (/vagas\/?$|empregos\/?$/.test(url)) continue;
    found.add(url);
  }
  // hrefs relativos (ex.: jobartis usa paths relativos)
  const testRe = new RegExp(pattern.source, "i");
  const relRe = /href=["'](\/[^"']+)["']/gi;
  let rm;
  while ((rm = relRe.exec(html)) !== null) {
    const abs = `https://${baseHost}${rm[1]}`;
    if (testRe.test(abs)) {
      found.add(abs.split(/[?#]/)[0]);
    }
  }
  return [...found];
}

function getQueries(): string[] {
  const env = Deno.env.get("SCRAPE_QUERIES");
  if (!env) return DEFAULT_QUERIES;
  return env.split(",").map((s) => s.trim()).filter(Boolean);
}

async function collectListings(source: JobSource, queries: string[], seen: Set<string>, maxJobs: number, budget: { left: number }): Promise<ListingItem[]> {
  const listings: ListingItem[] = [];

  if (source.rssUrl) {
    try {
      const rssLinks = await fetchRssLinks(source.rssUrl, /\/vagas\//i);
      for (const url of rssLinks) {
        if (!url || seen.has(url)) continue;
        seen.add(url);
        listings.push({ url, name: "", source: source.name });
        if (listings.length >= maxJobs) return listings;
      }
    } catch (e) {
      console.warn(`RSS ${source.name} ignorado:`, e);
    }
  }

  const listPages: string[] = [];
  const maxPages = source.maxPages ?? 1;
  for (const tpl of source.listingUrls) {
    for (let p = 1; p <= maxPages; p++) {
      const url = tpl.includes("{page}") ? tpl.replace("{page}", String(p)) : (p === 1 ? tpl : "");
      if (url) listPages.push(url);
    }
  }
  if (source.searchUrl) {
    for (const q of queries) {
      for (let p = 1; p <= 3; p++) listPages.push(source.searchUrl(q, p));
    }
  }

  const host = new URL(source.listingUrls[0]).hostname.replace(/^www\./, "");

  for (const url of listPages) {
    if (listings.length >= maxJobs || budget.left <= 0) break;
    const html = await fetchHtml(url);
    if (!html) continue;
    budget.left--;

    // JSON-LD CollectionPage (angolaemprego)
    for (const item of parseListing(html)) {
      if (!item.url || seen.has(item.url)) continue;
      seen.add(item.url);
      listings.push({ url: item.url, name: item.name, source: source.name });
      if (listings.length >= maxJobs) break;
    }

    // Links por regex (genérico)
    for (const link of extractLinks(html, source.linkPattern, host)) {
      if (seen.has(link)) continue;
      seen.add(link);
      listings.push({ url: link, source: source.name });
      if (listings.length >= maxJobs) break;
    }
    if (listings.length >= maxJobs) break;
  }
  return listings;
}

serve(async (req) => {
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (cronSecret) {
      const provided = req.headers.get("x-cron-secret") || "";
      if (provided !== cronSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
    }

    if (req.method !== "POST" && req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Método não suportado" }), { status: 405 });
    }

    let manual = false;
    try {
      const body = await req.json();
      manual = !!body.manual;
    } catch {
      // body pode estar vazio
    }

    const MAX_JOBS_PER_RUN = manual ? MANUAL_MAX_JOBS_PER_RUN : DEFAULT_MAX_JOBS_PER_RUN;

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
    // Orçamento de fetches de páginas de listagem para não estourar o tempo da edge function
    const budget = { left: 40 };
    // Quota por fonte para que nenhuma fonte esgote o lote inteiro
    const perSourceMax = Math.max(3, Math.ceil(MAX_JOBS_PER_RUN / SOURCES.length));

    for (const source of SOURCES) {
      if (listings.length >= MAX_JOBS_PER_RUN || budget.left <= 0) break;
      try {
        const items = await collectListings(source, queries, seen, perSourceMax, budget);
        listings.push(...items);
      } catch (e) {
        console.warn(`Fonte ${source.name} falhou:`, e);
      }
    }

    const results: { url: string; title: string; source: string; status: string }[] = [];
    let insertedCount = 0;

    for (const item of listings) {
      try {
        const { count } = await supabase
          .from("external_jobs")
          .select("id", { count: "exact", head: true })
          .eq("url", item.url);

        if ((count ?? 0) > 0) {
          results.push({ url: item.url, title: item.name || "", source: item.source, status: "duplicado" });
          continue;
        }

        const detailHtml = await fetchHtml(item.url);
        if (!detailHtml) {
          results.push({ url: item.url, title: item.name || "", source: item.source, status: "erro HTTP" });
          continue;
        }
        const job = parseJobDetail(detailHtml);
        const pageText = htmlToText(detailHtml);

        const description = job?.description || pageText.slice(0, 4000);
        const title = job?.title || item.name || extractTitle(detailHtml);

        let contactEmail = extractEmail(description) || extractEmail(pageText);
        const applyMatch = detailHtml.match(/href=["'](mailto:[^"']+)["']/i);
        if (!contactEmail && applyMatch) {
          contactEmail = extractEmail(applyMatch[1].replace(/^mailto:/i, ""));
        }
        // decodifica emails dentro de HTML escapado (&quot; etc.)
        if (!contactEmail) {
          const decoded = detailHtml.replace(/&quot;/g, '"').replace(/&#0*64;|&#x40;/g, "@");
          contactEmail = extractEmail(decoded);
        }

        const payload = {
          title,
          company: job?.hiringOrganization?.name || null,
          location: job?.jobLocation?.address?.addressLocality || null,
          description,
          contact_info: contactEmail,
          requirements: "",
          url: item.url,
          source: item.source,
          raw_data: job || null,
        };

        const { data: inserted, error } = await supabase.from("external_jobs").insert(payload).select("id").single();
        if (error || !inserted) {
          results.push({ url: item.url, title: payload.title, source: item.source, status: `erro DB: ${error?.message || "sem id"}` });
        } else {
          insertedCount++;
          results.push({ url: item.url, title: payload.title, source: item.source, status: "inserido" });
          // O processamento da candidatura fica a cargo do retry-pending-jobs (cron/workflow)
          // para respeitar os limites de tokens/minuto da Groq.
        }
      } catch (itemError) {
        const msg = itemError instanceof Error ? itemError.message : String(itemError);
        results.push({ url: item.url, title: item.name || "", source: item.source, status: `erro: ${msg}` });
      }
    }

    const perSource = results.reduce((acc, r) => {
      acc[r.source] = (acc[r.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    await supabase.from("scraper_state").insert({
      source: "multi",
      jobs_found: listings.length,
      jobs_inserted: insertedCount,
      message: `Processadas ${results.length} vagas — ${JSON.stringify(perSource)}`,
    });

    return new Response(JSON.stringify({ ok: true, processed: results.length, inserted: insertedCount, per_source: perSource, jobs: results }), { status: 200 });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("scrape-jobs error:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
});
