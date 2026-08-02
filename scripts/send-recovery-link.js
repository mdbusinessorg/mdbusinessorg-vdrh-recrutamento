// Envia link de recuperação para o Matias definir password
const { createClient } = require("@supabase/supabase-js");
const nodemailer = require("nodemailer");
const ws = require("ws");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = process.env.MATIAS_EMAIL;
const APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USERNAME;
const FROM = process.env.EMAIL_REMETENTE || SMTP_USER;

if (!SUPABASE_URL || !SERVICE_KEY || !EMAIL || !APP_PASSWORD) {
  console.error("Faltam variáveis de ambiente");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

async function main() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: EMAIL,
    options: { redirectTo: "http://localhost:3000/admin/candidaturas" },
  });
  if (error) throw error;

  const actionLink = data.properties.action_link;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user: SMTP_USER, pass: APP_PASSWORD },
  });

  await transporter.sendMail({
    from: FROM,
    to: EMAIL,
    subject: "Acesso ao painel de Candidatura Automática",
    text: `Olá Matias,

A tua conta no painel privado de Candidatura Automática foi criada.

Clica no link abaixo para definires a tua password:

${actionLink}

Se o link não abrir correctamente, podes copiar e colar no browser. O redirect está configurado para localhost:3000, mas podes alterar o SITE_URL no Supabase para o teu domínio de produção.

Após definires a password, acede a /admin/candidaturas.
`,
  });

  console.log("Email de recuperação enviado para", EMAIL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
