// Gera e define uma password para o Matias, e envia por email
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

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let pass = "";
  for (let i = 0; i < 18; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

async function main() {
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
  const user = list?.users?.find((u) => u.email === EMAIL);
  if (!user) throw new Error("Utilizador não encontrado");

  const password = generatePassword();

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password });
  if (updateError) throw updateError;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user: SMTP_USER, pass: APP_PASSWORD },
  });

  await transporter.sendMail({
    from: FROM,
    to: EMAIL,
    subject: "Credenciais de acesso — Candidatura Automática",
    text: `Olá Matias,

A tua conta no painel de Candidatura Automática está pronta.

Email: ${EMAIL}
Password: ${password}

Acede aqui: https://mosalo-auto-candidatura.netlify.app/admin/candidaturas

Após fazeres login, podes alterar a password no painel (quando implementares essa opção) ou pedir para redefinir.

Importante:
- Completa o perfil em /admin/candidaturas.
- Carrega pelo menos um CV em PDF.
- Verifica o alias suporte@mosalo.eu.cc no Gmail antes de activar o envio real.
`,
  });

  console.log("Password definida e email enviado para", EMAIL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
