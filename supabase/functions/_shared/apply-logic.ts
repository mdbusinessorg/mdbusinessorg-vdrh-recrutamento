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
  cv_recomendado_id: string;
  skills_destacadas: string[];
  assunto_email: string;
  corpo_email: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function getSupabaseClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY em falta");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export function extractEmail(text?: string | null): string | null {
  if (!text) return null;
  const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const matches = text.match(regex);
  return matches ? matches[0] : null;
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
  messages: any[]
): Promise<GroqResponse | null> {
  const resp = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Groq HTTP ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Resposta vazia da Groq");
  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return parsed as GroqResponse;
  } catch (e) {
    throw new Error(`JSON inválido da Groq: ${content}`);
  }
}

export function buildPrompt(
  job: ExternalJob,
  profile: CandidateProfile,
  cvs: CandidateCV[]
): any[] {
  const cvsBlock = cvs
    .map(
      (cv) =>
        `- ID: ${cv.id}\n  Título: ${cv.titulo}\n  Cargo-alvo: ${cv.cargo_alvo}\n  Skills cobertas: ${(cv.skills_cobertas || []).join(", ")}`
    )
    .join("\n");

  const system = `És um assistente de recrutamento automático do Matias para o projecto MÔ SALO.
O teu trabalho é analisar uma vaga de emprego, compará-la com o perfil do candidato e gerar uma carta de apresentação curta e profissional em português.

REGRAS FUNDAMENTAIS:
1. NUNCA inventes experiências, certificações, formações ou referências que não estejam no perfil/cvs fornecidos.
2. Escolhe o CV cujo cargo-alvo e skills cobertas batam mais com a vaga.
3. O score_match deve reflectir a verdadeira adequação (0 a 100).
4. O corpo do email deve ter 150-250 palavras, profissional, em português.
5. Cita 3 a 5 skills/certificações do perfil que batam com a vaga.
6. Menciona a formação no INP e a experiência na SLB (ESSO/NGC) apenas quando GENUINAMENTE relevantes para a vaga.
7. Devolve APENAS um objecto JSON válido com as chaves: score_match (número), cv_recomendado_id (uuid), skills_destacadas (array de strings), assunto_email (string), corpo_email (string).`;

  const user = `PERFIL DO CANDIDATO:
Nome: ${profile.full_name}
Bio/percurso: ${profile.bio_longa}
Formação: ${profile.formacao || "N/A"}
Certificações: ${(profile.certificacoes || []).join(", ")}
Skills: ${(profile.skills || []).join(", ")}

CVS DISPONÍVEIS:
${cvsBlock || "Nenhum CV disponível."}

VAGA:
Título: ${job.title || "N/A"}
Empresa: ${job.company || "N/A"}
Localização: ${job.location || "N/A"}
Descrição: ${job.description || "N/A"}
Requisitos: ${job.requirements || "N/A"}
Contacto: ${job.contact_info || "N/A"}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function coerceScore(score: any): number {
  const n = Number(score);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
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

  const profile = await getProfile(supabase);
  if (!profile) throw new Error("Perfil do candidato não encontrado");

  const cvs = await getActiveCVs(supabase);
  if (cvs.length === 0) throw new Error("Nenhum CV activo");

  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (!groqKey) throw new Error("GROQ_API_KEY em falta");

  const messages = buildPrompt(job, profile, cvs);
  const groqResult = await callGroq(groqKey, DEFAULT_MODEL, messages);
  if (!groqResult) throw new Error("Resposta inválida da Groq");

  const score = coerceScore(groqResult.score_match);
  const cv = pickBestCV(cvs, groqResult.cv_recomendado_id);

  if (score < settings.score_minimo) {
    console.log(`Vaga ${jobId} com score ${score} abaixo do mínimo ${settings.score_minimo}.`);
    await logApplication(supabase, {
      external_job_id: jobId,
      status: "sem_match",
      cv_usado_id: cv?.id || null,
      email_destino: emailDestino,
      score_match: score,
      skills_destacadas: groqResult.skills_destacadas || [],
      assunto_email: groqResult.assunto_email,
      corpo_email: groqResult.corpo_email,
    });
    return;
  }

  if (!cv) throw new Error("CV recomendado não encontrado");

  const pdfBytes = await downloadCV(supabase, cv.arquivo_url);
  if (!pdfBytes) throw new Error(`Não foi possível descarregar o CV ${cv.id}`);

  await sendEmailWithRetry(
    emailDestino,
    groqResult.assunto_email,
    groqResult.corpo_email,
    { filename: `${cv.titulo}.pdf`.replace(/\s+/g, "_"), bytes: pdfBytes },
    3
  );

  await logApplication(supabase, {
    external_job_id: jobId,
    status: "enviado",
    cv_usado_id: cv.id,
    email_destino: emailDestino,
    assunto_email: groqResult.assunto_email,
    corpo_email: groqResult.corpo_email,
    score_match: score,
    skills_destacadas: groqResult.skills_destacadas || [],
  });

  console.log(`Candidatura enviada para ${emailDestino} (score: ${score})`);
}
