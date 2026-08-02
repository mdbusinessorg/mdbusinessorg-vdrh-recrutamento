// Teste end-to-end local do módulo de candidatura automática
// Corre com: node --env-file=.env.local scripts/test-auto-apply.js

const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;
const SEND_EMAIL = process.env.SEND_EMAIL === "true";
const SCORE_MIN = Number(process.env.SCORE_MIN || 55);

if (!SUPABASE_URL || !SERVICE_KEY || !GROQ_KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou GROQ_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-70b-versatile";

const TEST_EMAIL = "test@mosalo.local";
const TEST_PASSWORD = "test-password-123";

const profileData = {
  full_name: "Matias Domingos",
  bio_longa:
    "Profissional com sólida experiência na indústria de petróleo e gás em Angola. Iniciei carreira no INP (Instituto Nacional de Petróleo), onde adquiri formação técnica de base. Segui para a Schlumberger (SLB), ao serviço dos projectos ESSO e NGC, com funções operacionais offshore em plataformas e instalações de produção. Experiência prática em rigging, slinging, operações de guindaste, manuseamento de cargas, segurança QHSE e apoio à produção. Proativo, com disponibilidade para rotação offshore e mobilidade.",
  formacao: "INP — Instituto Nacional de Petróleo",
  certificacoes: [
    "IWCF",
    "BST",
    "HUET",
    "Banksman & Slinger",
    "First Aid",
    "SIPP 1&2",
    "NEST",
    "CTA",
    "Fire Watcher",
    "Rigging and Slinging",
    "MyPCP QHSE (GIN)",
  ],
  skills: [
    "Rigger",
    "Banksman & Slinger",
    "Rigging and Slinging",
    "Segurança Offshore",
    "Operações de Carga",
    "QHSE",
    "First Aid",
    "HUET",
    "Trabalho em Equipa",
    "Disponibilidade offshore",
  ],
};

async function getOrCreateTestUser() {
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
  const existing = list?.users?.find((u) => u.email === TEST_EMAIL);
  if (existing) return existing.id;
  const { data, error } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

async function seedProfile(userId) {
  const { data } = await supabase.from("candidate_profile").select("id").eq("user_id", userId).limit(1).single();
  const payload = { ...profileData, user_id: userId, updated_at: new Date().toISOString() };
  if (data) {
    await supabase.from("candidate_profile").update(payload).eq("id", data.id);
  } else {
    await supabase.from("candidate_profile").insert(payload);
  }
}

async function seedCV(userId) {
  const pdfPath = path.join(__dirname, "test-cv.pdf");
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n106\n%%EOF`;
  fs.writeFileSync(pdfPath, pdf);

  try {
    await supabase.storage.createBucket("cvs", { public: false });
  } catch {
    // exists
  }

  const storagePath = `${userId}/test-cv.pdf`;
  const { error: uploadError } = await supabase.storage.from("cvs").upload(storagePath, fs.readFileSync(pdfPath), {
    contentType: "application/pdf",
    upsert: true,
  });
  if (uploadError) throw uploadError;

  const { data: existing } = await supabase.from("candidate_cvs").select("id").eq("user_id", userId).limit(1).single();
  const payload = {
    user_id: userId,
    titulo: "CV Rigger",
    cargo_alvo: "Rigger / Banksman & Slinger",
    arquivo_url: storagePath,
    skills_cobertas: ["Rigger", "Banksman", "Slinging", "QHSE", "Offshore"],
    ativo: true,
  };
  if (existing) {
    await supabase.from("candidate_cvs").update(payload).eq("id", existing.id);
    return existing.id;
  }
  const { data, error } = await supabase.from("candidate_cvs").insert(payload).select("id").single();
  if (error) throw error;
  return data.id;
}

function extractEmail(text) {
  const matches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  return matches ? matches[0] : null;
}

async function ensureSettings() {
  const { data } = await supabase
    .from("auto_apply_settings")
    .select("*")
    .order("id", { ascending: false })
    .limit(1)
    .single();
  if (!data) {
    await supabase.from("auto_apply_settings").insert({
      ativo: true,
      score_minimo: SCORE_MIN,
      limite_diario: 15,
      email_remetente: "suporte@mosalo.eu.cc",
    });
  }
}

async function seedJobs(userId) {
  const jobs = [
    {
      title: "Rigger / Banksman & Slinger — Offshore Angola",
      company: "Oceaneering Angola",
      location: "Luanda / Offshore",
      description:
        "Procuramos Rigger com experiência em rigging e slinging para operações offshore. Requisitos: certificação Banksman & Slinger, Rigging and Slinging, HUET, First Aid, experiência em plataformas petrolíferas. O candidato deve ser proativo e ter disponibilidade para rotação offshore.",
      contact_info: "Envie o CV para recrutamento@oceaneering.ao com o assunto 'Rigger Offshore'.",
      requirements: "Banksman & Slinger, Rigging, HUET, First Aid, offshore",
      source: "test",
    },
    {
      title: "Técnico de Segurança QHSE",
      company: "Empresa de Construção",
      location: "Luanda",
      description:
        "Vaga para técnico de segurança QHSE em obra de construção civil. Experiência em gestão de segurança e certificações relevantes.",
      contact_info: "Candidaturas via WhatsApp: +244 900 000 000.",
      requirements: "QHSE, segurança obra",
      source: "test",
    },
    {
      title: "Desenvolvedor de Software Python",
      company: "Tech Startup",
      location: "Luanda",
      description:
        "Procuramos programador Python com experiência em Django, APIs REST e cloud. Trabalho remoto.",
      contact_info: "Envie para devs@startup.ao.",
      requirements: "Python, Django, APIs REST",
      source: "test",
    },
  ];

  const ids = [];
  for (const job of jobs) {
    const { data, error } = await supabase.from("external_jobs").insert(job).select("id").single();
    if (error) throw error;
    ids.push(data.id);
  }
  return ids;
}

function buildPrompt(job, profile, cvs) {
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

async function callGroq(messages) {
  const resp = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) throw new Error(`Groq HTTP ${resp.status}: ${await resp.text()}`);
  const json = await resp.json();
  const content = json.choices?.[0]?.message?.content;
  return typeof content === "string" ? JSON.parse(content) : content;
}

async function sendEmailMock(dest, subject, body) {
  if (SEND_EMAIL) {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME || process.env.EMAIL_REMETENTE,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_REMETENTE,
      to: dest,
      subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    });
    console.log("Email enviado para", dest);
  } else {
    console.log("[DRY RUN] Email seria enviado para", dest, "- assunto:", subject);
  }
}

async function processJob(jobId, profile, cvs) {
  const { data: job } = await supabase.from("external_jobs").select("*").eq("id", jobId).single();
  const searchText = [job.description, job.contact_info, job.requirements, job.title, job.company].filter(Boolean).join("\n");
  const email = extractEmail(searchText);

  if (!email) {
    await supabase.from("job_applications_log").insert({
      external_job_id: jobId,
      status: "sem_email",
      score_match: null,
    });
    return { jobId, status: "sem_email" };
  }

  const groq = await callGroq(buildPrompt(job, profile, cvs));
  const score = Math.min(100, Math.max(0, Number(groq.score_match) || 0));
  const cv = cvs.find((c) => c.id === groq.cv_recomendado_id) || cvs[0];

  if (score < SCORE_MIN) {
    await supabase.from("job_applications_log").insert({
      external_job_id: jobId,
      status: "sem_match",
      cv_usado_id: cv?.id || null,
      email_destino: email,
      score_match: score,
      skills_destacadas: groq.skills_destacadas || [],
      assunto_email: groq.assunto_email,
      corpo_email: groq.corpo_email,
    });
    return { jobId, status: "sem_match", score };
  }

  await sendEmailMock(email, groq.assunto_email, groq.corpo_email);

  await supabase.from("job_applications_log").insert({
    external_job_id: jobId,
    status: "enviado",
    cv_usado_id: cv?.id || null,
    email_destino: email,
    score_match: score,
    skills_destacadas: groq.skills_destacadas || [],
    assunto_email: groq.assunto_email,
    corpo_email: groq.corpo_email,
  });

  return { jobId, status: "enviado", score, email };
}

async function cleanup() {
  const { data: jobs } = await supabase.from("external_jobs").select("id").eq("source", "test");
  if (jobs?.length) {
    const ids = jobs.map((j) => j.id);
    await supabase.from("job_applications_log").delete().in("external_job_id", ids);
    await supabase.from("external_jobs").delete().in("id", ids);
  }
}

(async () => {
  try {
    console.log("A iniciar testes...");
    await ensureSettings();
    await cleanup();

    const userId = await getOrCreateTestUser();
    await seedProfile(userId);
    const cvId = await seedCV(userId);

    const { data: profile } = await supabase
      .from("candidate_profile")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .single();
    const { data: cvs } = await supabase.from("candidate_cvs").select("*").eq("user_id", userId);

    const jobIds = await seedJobs(userId);
    const results = [];
    for (const jobId of jobIds) {
      const result = await processJob(jobId, profile, cvs || [{ id: cvId }]);
      results.push(result);
    }

    console.log("\nResultados:");
    for (const r of results) {
      console.log(`- ${r.jobId}: ${r.status}${r.score !== undefined ? ` (score: ${r.score})` : ""}${r.email ? ` -> ${r.email}` : ""}`);
    }
    console.log("\nTeste concluído. Verifica a tabela job_applications_log no Supabase.");
  } catch (e) {
    console.error("Erro no teste:", e);
    process.exit(1);
  }
})();
