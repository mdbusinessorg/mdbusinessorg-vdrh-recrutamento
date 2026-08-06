// Lógica compartilhada entre process-new-job e retry-pending-jobs
// Deno + Supabase Edge Runtime

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

export interface CandidateProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio_longa: string;
  formacao?: string;
  certificacoes?: string[];
  skills?: string[];
  referencias?: any[];
}

export interface CandidateCV {
  id: string;
  user_id: string;
  titulo: string;
  cargo_alvo: string;
  arquivo_url: string;
  skills_cobertas?: string[];
  conteudo_texto?: string | null;
  ativo: boolean;
}

export interface ExternalJob {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  contact_info?: string;
  requirements?: string;
  url?: string;
  source?: string;
  raw_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Settings {
  id: string;
  ativo: boolean;
  score_minimo: number;
  limite_diario: number;
  email_remetente: string;
}

export interface GroqResponse {
  score_match: number;
  skills_destacadas: string[];
  cv_recomendado_id?: string;
  assunto_email?: string;
  corpo_email?: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

export function getSupabaseClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY em falta");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

const COMMON_TLDS = new Set([
  "com", "org", "net", "edu", "gov", "info", "biz", "name", "pro", "coop", "museum",
  "aero", "jobs", "mobi", "travel", "app", "dev", "io", "ai", "co", "uk", "fr", "de",
  "it", "es", "pt", "us", "br", "ao", "mz", "ml", "ng", "ke", "za", "zm", "cd", "ao",
  "co.ao", "co.uk", "co.za", "com.br", "com.pt", "com.ao", "com.ang", "gmail.com",
  "hotmail.com", "outlook.com", "yahoo.com", "live.com", "icloud.com", "mail.com",
  "protonmail.com", "yandex.com", "qq.com", "163.com", "126.com",
]);

function getSingleTlds(): string[] {
  return [...COMMON_TLDS].filter((t) => !t.includes(".")).sort((a, b) => b.length - a.length);
}

function getDoubleTlds(): string[] {
  return [...COMMON_TLDS].filter((t) => t.includes(".")).sort((a, b) => b.length - a.length);
}

function cutEmail(match: string): string | null {
  const lower = match.toLowerCase();
  const at = lower.lastIndexOf("@");
  if (at <= 0) return null;
  const local = match.slice(0, at + 1);
  const domainRest = match.slice(at + 1);
  const domainParts = domainRest.split(".");
  const domainPartsLower = domainRest.toLowerCase().split(".");
  let cleanParts: string[] | null = null;

  if (domainParts.length >= 2) {
    const lastTwo = domainPartsLower[domainParts.length - 2] + "." + domainPartsLower[domainParts.length - 1];
    const lastTwoOrig = domainParts[domainParts.length - 2] + "." + domainParts[domainParts.length - 1];
    for (const tld of getDoubleTlds()) {
      if (lastTwo.startsWith(tld)) {
        const tldParts = tld.split(".");
        const remaining = lastTwoOrig.slice(tld.length);
        if (remaining !== "" && /[a-z0-9-]/.test(remaining[0])) continue;
        cleanParts = domainParts.slice(0, -2).concat(tldParts);
        break;
      }
    }
  }

  if (!cleanParts) {
    const last = domainPartsLower[domainParts.length - 1];
    const lastOrig = domainParts[domainParts.length - 1];
    for (const tld of getSingleTlds()) {
      if (last.startsWith(tld)) {
        const remaining = lastOrig.slice(tld.length);
        if (remaining !== "" && /[a-z0-9-]/.test(remaining[0])) continue;
        cleanParts = domainParts.slice(0, -1).concat([tld]);
        break;
      }
    }
  }

  if (!cleanParts) return null;
  const clean = local + cleanParts.join(".");
  return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(clean) ? clean : null;
}

const BLOCKED_DOMAINS = new Set(["angolaemprego.com"]);

export function extractEmail(text?: string | null): string | null {
  if (!text) return null;
  const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
  const matches = text.match(regex);
  if (!matches) return null;
  for (const match of matches) {
    const cleaned = cutEmail(match);
    if (cleaned) {
      const domain = cleaned.split("@")[1]?.toLowerCase();
      if (domain && !BLOCKED_DOMAINS.has(domain)) return cleaned;
    }
  }
  return null;
}

export async function getSettings(supabase: SupabaseClient): Promise<Settings | null> {
  const { data, error } = await supabase
    .from("auto_apply_settings")
    .select("*")
    .order("id", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    console.error("Erro ao obter settings:", error);
    return null;
  }
  return data as Settings;
}

export async function getProfile(supabase: SupabaseClient): Promise<CandidateProfile | null> {
  const { data, error } = await supabase
    .from("candidate_profile")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    if (error.code !== "PGRST116") console.error("Erro ao obter perfil:", error);
    return null;
  }
  return data as CandidateProfile;
}

export async function getActiveCVs(supabase: SupabaseClient): Promise<CandidateCV[]> {
  const { data, error } = await supabase
    .from("candidate_cvs")
    .select("*")
    .eq("ativo", true)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Erro ao obter CVs:", error);
    return [];
  }
  return (data as CandidateCV[]) || [];
}

export async function getJob(supabase: SupabaseClient, jobId: string): Promise<ExternalJob | null> {
  const { data, error } = await supabase.from("external_jobs").select("*").eq("id", jobId).single();
  if (error) {
    console.error("Erro ao obter vaga:", error);
    return null;
  }
  return data as ExternalJob;
}

export async function logApplication(
  supabase: SupabaseClient,
  payload: {
    external_job_id: string;
    status: string;
    cv_usado_id?: string | null;
    email_destino?: string | null;
    assunto_email?: string | null;
    corpo_email?: string | null;
    score_match?: number | null;
    skills_destacadas?: string[] | null;
    erro_detalhe?: string | null;
  }
) {
  const { error } = await supabase.from("job_applications_log").insert(payload);
  if (error) {
    console.error("Erro ao inserir log:", error);
  }
}

export async function checkDuplicate(supabase: SupabaseClient, jobId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("job_applications_log")
    .select("id", { count: "exact", head: true })
    .eq("external_job_id", jobId);
  if (error) {
    console.error("Erro ao verificar duplicado:", error);
    return false;
  }
  return (count || 0) > 0;
}

export async function checkDailyLimit(supabase: SupabaseClient, limit: number): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const { count, error } = await supabase
    .from("job_applications_log")
    .select("id", { count: "exact", head: true })
    .eq("status", "enviado")
    .gte("created_at", `${today}T00:00:00Z`)
    .lt("created_at", `${today}T23:59:59Z`);
  if (error) {
    console.error("Erro ao verificar limite diário:", error);
    return false;
  }
  return (count || 0) >= limit;
}

export async function callGroq(
  apiKey: string,
  model: string,
  messages: any[],
  maxTokens = 700,
  retries = 3
): Promise<GroqResponse | null> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        const isDailyLimit = text.includes("tokens per day") || text.includes("TPD");
        if (isDailyLimit) {
          throw new Error(`Groq daily token limit reached: ${text}`);
        }
        if ((resp.status === 429 || resp.status >= 500) && attempt < retries) {
          const delay = 2 ** attempt * 1000;
          console.warn(`Groq ${resp.status}, retry ${attempt + 1}/${retries} após ${delay}ms`);
          await new Promise((r) => setTimeout(r, delay));
          lastError = new Error(`Groq HTTP ${resp.status}: ${text}`);
          continue;
        }
        throw new Error(`Groq HTTP ${resp.status}: ${text}`);
      }
      const json = await resp.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error("Resposta vazia da Groq");
      const parsed = typeof content === "string" ? JSON.parse(content) : content;
      return parsed as GroqResponse;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) {
        const delay = 2 ** attempt * 1000;
        console.warn(`Groq erro, retry ${attempt + 1}/${retries} após ${delay}ms: ${lastError.message}`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError || new Error("Falha ao contactar a Groq");
}

function coerceScore(score: any): number {
  const n = Number(score);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

const RELEVANT_KEYWORDS = [
  "rigger", "rigging", "banksman", "slinger", "slinging", "maintenance", "technician",
  "mecânico", "mecanico", "electromecânico", "electromecanico", "mecânica", "mecanica",
  "offshore", "onshore", "oil", "gas", "petróleo", "petroleo", "plataforma", "platform",
  "crane", "lifting", "guindaste", "grua", "industrial", "hse", "qhse", "safety",
  "operator", "operador", "production", "produção", "producao", "field", "subsea",
  "instalações", "instalacoes", "instalação", "instalacao", "construção", "construcao",
  "welding", "welder", "soldador", "electricista", "electrica", "eléctrica", "eletricista",
];

function isRelevantJob(job: ExternalJob): boolean {
  const text = `${job.title || ""} ${job.description || ""} ${job.requirements || ""} ${job.company || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return RELEVANT_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

function normalizeText(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function determineCargoApresentar(job: ExternalJob): string {
  const text = normalizeText(`${job.title || ""} ${job.description || ""} ${job.requirements || ""}`);
  if (text.includes("banksman") || text.includes("slinger")) return "Banksman & Slinger";
  if (text.includes("project management") || text.includes("pmp") || text.includes("power bi") || text.includes("ms project")) {
    return "Project Management Intern / Technician";
  }
  if (text.includes("maintenance technician") || text.includes("tecnico de manutencao") || text.includes("manutencao") || text.includes("maintenance") || text.includes("rigger") || text.includes("rigging")) {
    return "Maintenance Technician / Rigger";
  }
  if (text.includes("well completion") || text.includes("completion") || text.includes("scssv") || text.includes("fiv") || text.includes("psv")) {
    return "Well Completion & Electro-Mechanical Maintenance Technician";
  }
  return "Maintenance Technician / Rigger";
}

const PT_MARKERS = [
  "vaga", "candidato", "candidatura", "requisitos", "experiência", "experiencia", "formação", "formacao",
  "empresa", "local", "angola", "luanda", "salário", "habilitações", "licenciatura", "ensino", "técnico",
  "tecnico", "mecânico", "mecanico", "manutenção", "manutencao", "requisito", "desejável", "desejavel",
  "exigido", "fluente", "português", "portugues", "precisa-se", "recrutamento",
];
const EN_MARKERS = [
  "job", "position", "candidate", "requirements", "experience", "education", "company", "location",
  "salary", "required", "desired", "fluent", "english", "apply", "resume", "cv", "hiring", "work",
];

export function determineLanguage(job: ExternalJob): "pt" | "en" {
  const text = `${job.title || ""} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
  const pt = PT_MARKERS.reduce((sum, m) => sum + (text.includes(m) ? 1 : 0), 0);
  const en = EN_MARKERS.reduce((sum, m) => sum + (text.includes(m) ? 1 : 0), 0);
  return pt >= en ? "pt" : "en";
}

const CARGO_SKILL_PATTERNS: Record<string, string[]> = {
  "Banksman & Slinger": ["banksman", "slinger", "lifting", "load control", "crane", "guindaste", "loto", "jsa", "ptw", "risk", "hse", "safety"],
  "Project Management Intern / Technician": ["power bi", "ms project", "project", "pmp", "planning", "reporting", "dashboard", "monitoring"],
  "Well Completion & Electro-Mechanical Maintenance Technician": ["scssv", "fiv", "psv", "packers", "tubing hangers", "xmas tree", "wireline", "hpu", "pneumatic", "hydraulic", "well completion"],
  "Maintenance Technician / Rigger": ["scssv", "fiv", "psv", "packers", "tubing hangers", "wireline", "pneumatic", "hydraulic", "maintenance", "rigger", "rigging", "crane", "lifting", "mpi", "qaqc", "loto", "jsa", "ptw"],
};

function scoreSkill(job: ExternalJob, skill: string, cargo: string): number {
  const jobText = normalizeText(`${job.title || ""} ${job.description || ""} ${job.requirements || ""}`);
  const skillNorm = normalizeText(skill);
  const parts = skillNorm.split(/[^\w\/+&-]+/).filter((p) => p.length > 2);
  let matches = 0;
  for (const p of parts) {
    if (jobText.includes(p)) matches++;
  }
  const cargoPatterns = CARGO_SKILL_PATTERNS[cargo] || [];
  for (const pat of cargoPatterns) {
    if (skillNorm.includes(pat)) matches += 2;
  }
  return matches;
}

function pickRelevantSkillPool(job: ExternalJob, profile: CandidateProfile): string[] {
  const cargo = determineCargoApresentar(job);
  const combined = [...(profile.skills || []), ...(profile.certificacoes || [])];
  const scored = combined
    .filter((s) => s && s.trim().length > 1)
    .map((skill) => ({ skill, score: scoreSkill(job, skill, cargo) }));
  scored.sort((a, b) => b.score - a.score);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const { skill } of scored) {
    const key = skill.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(skill);
    }
    if (unique.length >= 10) break;
  }
  return unique;
}

const EXPERIENCE_SENTENCES: Record<string, Record<string, string>> = {
  pt: {
    A: "Como Well Completion and Electro-Mechanical Maintenance Technician, apoiei projectos offshore de well completion na SLB, incluindo montagem, inspeção e manutenção de SCSSV, FIV, PSV, packers, tubing hangers, wireline tools e equipamentos de lifting/rigging, calibrados conforme especificações OEM/SLB.",
    B: "Na Cimertex, executei manutenção preventiva e corretiva de equipamentos pesados e geradores industriais, incluindo sistemas hidráulicos, bombas, motores e sistemas de arrefecimento, com suporte às operações de mineração em Catoca e Kaxepa.",
    C: "Como Project Management Intern na Ekton Project Analytics atribuído à Chevron no Bloco Mafumeira, apoiei o planeamento, monitorização e controlo de projecto, dashboards em Power BI e reporting em MS Project.",
    D: "Certificado como Banksman & Slinger pela SLB, realizei planos de lifting, controlo de cargas e supervisão de segurança de guindastes, integrando as práticas de LOTO/PTW/JSA com registo zero de acidentes.",
    E: "Formado pelo Instituto Nacional de Petróleos (INP) em Electromecânica / Oil & Gas com Distinção (16/20), tenho base sólida em equipamentos e sistemas offshore.",
  },
  en: {
    A: "As a Well Completion and Electro-Mechanical Maintenance Technician, I supported offshore well completion projects at SLB, including assembly, inspection and maintenance of SCSSV, FIV, PSV, packers, tubing hangers, wireline tools and lifting/rigging equipment, calibrated to OEM/SLB specs.",
    B: "At Cimertex, I carried out preventive and corrective maintenance on heavy equipment and industrial generators, including hydraulic systems, pumps, engines and cooling systems, supporting mining operations at Catoca and Kaxepa.",
    C: "As a Project Management Intern at Ekton Project Analytics assigned to Chevron’s Block Mafumeira, I supported project planning, monitoring and control, Power BI dashboards and MS Project reporting.",
    D: "Certified as Banksman & Slinger by SLB, I prepared lifting plans, load control and crane safety oversight, integrating LOTO/PTW/JSA practices with a zero-accident record.",
    E: "I hold a Technical Diploma in Electromechanics / Oil & Gas from the Instituto Nacional de Petróleos (INP) with Distinction (16/20), giving me a solid foundation in offshore equipment and systems.",
  },
};

function pickExperience(job: ExternalJob, idioma: "pt" | "en"): string {
  const text = normalizeText(`${job.title || ""} ${job.description || ""} ${job.requirements || ""}`);
  const pool = EXPERIENCE_SENTENCES[idioma];
  const cargo = determineCargoApresentar(job);

  if (cargo === "Banksman & Slinger" || text.includes("banksman") || text.includes("slinger")) return pool.D;
  if (cargo === "Project Management Intern / Technician" || text.includes("project management") || text.includes("pmp") || text.includes("power bi") || text.includes("ms project") || text.includes("chevron") || text.includes("mafumeira") || text.includes("planeamento")) return pool.C;
  if (text.includes("cimertex") || text.includes("heavy equipment") || text.includes("mining") || text.includes("bulldozer") || text.includes("catoca") || text.includes("kaxepa") || text.includes("industrial generator")) return pool.B;
  if (text.includes("well completion") || text.includes("scssv") || text.includes("fiv") || text.includes("psv") || text.includes("packers") || text.includes("tubing hangers") || text.includes("wireline") || text.includes("subsea") || text.includes("rigger") || text.includes("rigging") || text.includes("lifting")) return pool.A;
  return pool.A;
}

export function buildPrompt(job: ExternalJob, profile: CandidateProfile, skillPool: string[]): any[] {
  const cargoApresentar = determineCargoApresentar(job);

  const system = `És um avaliador de compatibilidade entre um CV e uma vaga de emprego.
REGRAS:
1. NUNCA inventes informação.
2. score_match de 0 a 100, baseado na adequação real do candidato à vaga.
3. skills_destacadas: escolhe 3 a 5 skills/certificações da lista fornecida que mais batem com a vaga.
4. Devolve APENAS um JSON com as chaves: score_match (número) e skills_destacadas (array de strings).`;

  const user = `CANDIDATO:
Nome: ${profile.full_name}
Percurso: ${(profile.bio_longa || "").slice(0, 700)}
Formação: ${(profile.formacao || "N/A").slice(0, 300)}
Certificações: ${(profile.certificacoes || []).slice(0, 15).join(", ")}

Skills/certificações a escolher (3 a 5):
${skillPool.map((s) => `- ${s}`).join("\n")}

VAGA:
Cargo: ${(job.title || "N/A").slice(0, 120)}
Empresa: ${(job.company || "N/A").slice(0, 80)}
Descrição: ${(job.description || "").slice(0, 900)}
Requisitos: ${(job.requirements || "").slice(0, 400)}

O cargo a apresentar é "${cargoApresentar}". Devolve JSON com score_match e skills_destacadas.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export function buildEmail(
  job: ExternalJob,
  profile: CandidateProfile,
  cvs: CandidateCV[],
  selectedSkills: string[],
  idioma: "pt" | "en"
): { assunto_email: string; corpo_email: string } {
  const cargo = determineCargoApresentar(job);
  const experience = pickExperience(job, idioma);
  const cv = cvs[0];

  const saudacao = idioma === "en" ? "Dear Hiring Manager," : "Exmo.(a) Recrutador(a),";
  const abertura = idioma === "en" ? `I am writing to apply for the ${cargo} position.` : `Apresento a minha candidatura ao cargo de ${cargo}.`;
  const fecho = idioma === "en" ? "I am available for an interview and have attached my CV for review." : "Coloco-me à disposição para uma entrevista e envio o CV em anexo para análise.";
  const despedida = idioma === "en" ? "Best regards," : "Atentamente,";
  const assunto = idioma === "en" ? `Application for ${cargo} - Matias Domingos` : `Candidatura ao cargo de ${cargo} - Matias Domingos`;

  const skillsBlock = selectedSkills.slice(0, 5).map((s) => `• ${s}`).join("\n");

  const corpo = `${saudacao}

${abertura}

${experience}

${idioma === "en" ? "Relevant skills and certifications:" : "Skills e certificações relevantes:"}
${skillsBlock}

${fecho}

${despedida}
Matias Domingos | Luanda, Angola | +244 926 115 429 | matiasdomingos158@gmail.com | linkedin.com/in/matias-domingos-oilgas`;

  return { assunto_email: assunto, corpo_email: corpo };
}

function pickBestCV(cvs: CandidateCV[], cvId: string | null): CandidateCV | null {
  if (cvId) {
    const found = cvs.find((c) => c.id === cvId);
    if (found) return found;
  }
  return cvs[0] || null;
}

function getStoragePathFromUrl(arquivoUrl: string): string {
  try {
    const url = new URL(arquivoUrl);
    const parts = url.pathname.split("/");
    const bucketIndex = parts.indexOf("object") + 1;
    if (bucketIndex > 0 && parts.length > bucketIndex + 1) {
      return parts.slice(bucketIndex + 1).join("/");
    }
    return arquivoUrl;
  } catch {
    return arquivoUrl;
  }
}

export async function downloadCV(
  supabase: SupabaseClient,
  arquivoUrl: string
): Promise<Uint8Array | null> {
  const path = getStoragePathFromUrl(arquivoUrl);
  const bucket = "cvs";
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) {
    console.error("Erro ao descarregar CV:", error);
    return null;
  }
  return new Uint8Array(await data.arrayBuffer());
}

export async function sendEmailWithRetry(
  dest: string,
  subject: string,
  body: string,
  attachment: { filename: string; bytes: Uint8Array } | null,
  maxAttempts = 3
): Promise<void> {
  const password = Deno.env.get("GMAIL_APP_PASSWORD");
  const sender = Deno.env.get("EMAIL_REMETENTE") || "suporte@mosalo.eu.cc";
  const host = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
  const port = Number(Deno.env.get("SMTP_PORT") || 465);
  const username = Deno.env.get("SMTP_USERNAME") || sender;

  if (!password) throw new Error("GMAIL_APP_PASSWORD em falta");

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port,
        tls: true,
        auth: { username, password },
      },
    });
    try {
      await client.send({
        from: sender,
        to: dest,
        subject,
        content: body,
        html: body.replace(/\n/g, "<br>"),
        attachments: attachment
          ? [
              {
                filename: attachment.filename,
                content: attachment.bytes,
                encoding: "binary",
              } as any,
            ]
          : undefined,
      });
      await client.close();
      return;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.error(`Tentativa ${attempt} de email falhou:`, lastError.message);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, attempt * 2000));
      }
    }
  }
  throw lastError || new Error("Falha ao enviar email após retries");
}

export async function processJob(supabase: SupabaseClient, jobId: string) {
  const settings = await getSettings(supabase);
  if (!settings) throw new Error("Configurações do módulo não encontradas");

  if (!settings.ativo) {
    console.log(`Módulo desactivado. Vaga ${jobId} ignorada.`);
    return;
  }

  if (await checkDuplicate(supabase, jobId)) {
    console.log(`Vaga ${jobId} já processada.`);
    await logApplication(supabase, {
      external_job_id: jobId,
      status: "duplicado",
      score_match: null,
    });
    return;
  }

  if (await checkDailyLimit(supabase, settings.limite_diario)) {
    console.log(`Limite diário atingido. Vaga ${jobId} ficará pendente.`);
    return;
  }

  const job = await getJob(supabase, jobId);
  if (!job) throw new Error(`Vaga ${jobId} não encontrada`);

  const searchText = [job.description, job.contact_info, job.requirements, job.title, job.company].filter(Boolean).join("\n");
  const emailDestino = extractEmail(searchText);

  if (!emailDestino) {
    console.log(`Vaga ${jobId} sem email de contacto.`);
    await logApplication(supabase, {
      external_job_id: jobId,
      status: "sem_email",
      email_destino: null,
      score_match: null,
    });
    return;
  }

  if (!isRelevantJob(job)) {
    console.log(`Vaga ${jobId} não é relevante para o perfil do Matias.`);
    await logApplication(supabase, {
      external_job_id: jobId,
      status: "sem_match",
      email_destino: emailDestino,
      score_match: 0,
      skills_destacadas: [],
    });
    return;
  }

  const profile = await getProfile(supabase);
  if (!profile) throw new Error("Perfil do candidato não encontrado");

  const cvs = await getActiveCVs(supabase);
  if (cvs.length === 0) throw new Error("Nenhum CV activo");

  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (!groqKey) throw new Error("GROQ_API_KEY em falta");

  const idioma = determineLanguage(job);
  const cargoApresentar = determineCargoApresentar(job);
  const skillPool = pickRelevantSkillPool(job, profile);
  const messages = buildPrompt(job, profile, skillPool);
  const groqResult = await callGroq(groqKey, DEFAULT_MODEL, messages, 250);
  if (!groqResult) throw new Error("Resposta inválida da Groq");

  const score = coerceScore(groqResult.score_match);
  const cv = pickBestCV(cvs, groqResult.cv_recomendado_id);

  // Apenas aceita skills que constem no pool para evitar alucinações
  let selectedSkills = (groqResult.skills_destacadas || [])
    .filter((s) => typeof s === "string" && s.trim().length > 0)
    .filter((s) => skillPool.some((p) => p.toLowerCase().trim() === s.toLowerCase().trim()))
    .slice(0, 5);
  if (selectedSkills.length < 3) {
    selectedSkills = skillPool.slice(0, 5);
  }

  const { assunto_email, corpo_email } = buildEmail(job, profile, cvs, selectedSkills, idioma);

  if (score < settings.score_minimo) {
    console.log(`Vaga ${jobId} com score ${score} abaixo do mínimo ${settings.score_minimo}.`);
    await logApplication(supabase, {
      external_job_id: jobId,
      status: "sem_match",
      cv_usado_id: cv?.id || null,
      email_destino: emailDestino,
      score_match: score,
      skills_destacadas: selectedSkills,
      assunto_email,
      corpo_email,
    });
    return;
  }

  if (!cv) throw new Error("CV recomendado não encontrado");

  const pdfBytes = await downloadCV(supabase, cv.arquivo_url);
  if (!pdfBytes) throw new Error(`Não foi possível descarregar o CV ${cv.id}`);

  await sendEmailWithRetry(
    emailDestino,
    assunto_email,
    corpo_email,
    { filename: `${cv.titulo}.pdf`.replace(/\s+/g, "_"), bytes: pdfBytes },
    3
  );

  await logApplication(supabase, {
    external_job_id: jobId,
    status: "enviado",
    cv_usado_id: cv.id,
    email_destino: emailDestino,
    assunto_email,
    corpo_email,
    score_match: score,
    skills_destacadas: selectedSkills,
  });

  console.log(`Candidatura enviada para ${emailDestino} (score: ${score}, cargo: ${cargoApresentar})`);
}
