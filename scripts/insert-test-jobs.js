// Insere 5 vagas de teste e aguarda o processamento pelo webhook
const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

const jobs = [
  {
    title: "Rigger Offshore — Angola",
    company: "Oceaneering Angola",
    location: "Luanda / Offshore",
    description:
      "Procuramos Rigger com experiência comprovada em rigging and slinging, Banksman & Slinger, operações de carga offshore e segurança QHSE. Certificações HUET, First Aid e Rigging and Slinging valorizadas. Rotação offshore e disponibilidade imediata.",
    contact_info: "Candidaturas via email: matiasdomingos158@gmail.com",
    requirements: "Rigger, Banksman & Slinger, Rigging and Slinging, HUET, First Aid, QHSE, offshore",
  },
  {
    title: "Junior Production Operator",
    company: "ESSO/NGC Consortium",
    location: "Cabinda / Offshore",
    description:
      "Vaga para Junior Production Operator em instalações offshore. Experiência em plataformas, manuseamento de cargas, segurança QHSE e certificações offshore (HUET, BST) são diferenciais. Boa capacidade de trabalho em equipa.",
    contact_info: "Envie CV para matiasdomingos158@gmail.com",
    requirements: "Junior Production Operator, HUET, QHSE, offshore, trabalho em equipa",
  },
  {
    title: "Técnico de Segurança QHSE Offshore",
    company: "SLB Angola",
    location: "Soyo / Offshore",
    description:
      "Procuramos técnico de segurança QHSE para projecto offshore em Angola. Experiência na indústria de petróleo e gás, conhecimento de procedimentos de carga, rigging e slinging. Certificações First Aid e Fire Watcher valorizadas.",
    contact_info: "matiasdomingos158@gmail.com",
    requirements: "QHSE, segurança offshore, First Aid, Fire Watcher, rigging, slinging",
  },
  {
    title: "Banksman & Slinger — Offshore Rotativo",
    company: "Sonangol EP",
    location: "Luanda / Offshore",
    description:
      "Vaga para Banksman & Slinger com experiência em sinalização de guindastes, amarração de cargas e operações de içamento offshore. Certificações Banksman & Slinger, Rigging and Slinging e HUET obrigatórias. Disponibilidade para rotação.",
    contact_info: "Recrutamento: matiasdomingos158@gmail.com",
    requirements: "Banksman & Slinger, Rigging and Slinging, HUET, operações de carga, offshore",
  },
  {
    title: "Rigger / Slinger Onshore e Offshore",
    company: "TechnipFMC Angola",
    location: "Luanda / Malongo",
    description:
      "Contratamos Rigger / Slinger para projectos onshore e offshore em Angola. Necessário experiência em manuseamento de cargas, rigging, slinging e segurança QHSE. Certificações atualizadas (IWCF, CTA, Rigging and Slinging) são vantagem.",
    contact_info: "matiasdomingos158@gmail.com",
    requirements: "Rigger, Slinger, Rigging and Slinging, QHSE, IWCF, CTA, manuseamento de cargas",
  },
];

async function main() {
  const inserted = [];
  for (const job of jobs) {
    const { data, error } = await supabase.from("external_jobs").insert(job).select("id").single();
    if (error) {
      console.error("Erro ao inserir vaga:", error);
      continue;
    }
    inserted.push(data.id);
    console.log("Vaga inserida:", data.id);
  }

  console.log("\nAguardar processamento (60s)...");
  await new Promise((r) => setTimeout(r, 60000));

  const { data: logs, error } = await supabase
    .from("job_applications_log")
    .select("*")
    .in("external_job_id", inserted)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar logs:", error);
    process.exit(1);
  }

  console.log("\nLogs de candidaturas:");
  for (const log of logs || []) {
    console.log(`- ${log.external_job_id}: ${log.status} | score: ${log.score_match} | destino: ${log.email_destino}`);
    if (log.assunto_email) console.log(`  assunto: ${log.assunto_email}`);
    if (log.erro_detalhe) console.log(`  erro: ${log.erro_detalhe}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
