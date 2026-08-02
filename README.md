# MÔ SALO — Candidatura Automática

Plataforma privada e separada do MÔ SALO para auto-candidatura do Matias.

## Stack

- Next.js 14 + TypeScript + Tailwind CSS
- Supabase (novo projecto: `noywnuafpxvxvmfkjtbh`)
- Supabase Edge Functions (`process-new-job`, `retry-pending-jobs`)
- Groq (modelo `llama-3.1-70b-versatile`)
- Gmail SMTP (`suporte@mosalo.eu.cc`)

## Repositório

- Código local: `/home/ubuntu/repos/mosalo-auto-candidatura`
- Supabase URL: `https://noywnuafpxvxvmfkjtbh.supabase.co`

## Setup

1. Copia `.env.local.example` para `.env.local` e preenche:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
   - `GMAIL_APP_PASSWORD`
   - `EMAIL_REMETENTE` / `SMTP_USERNAME`
   - `MATIAS_EMAIL` — email que terá acesso ao painel

2. Aplica as migrations no Supabase SQL Editor:
   - Abre `supabase/migrations/20240802000000_initial.sql` e executa tudo.

3. Cria o bucket `cvs` no Supabase Storage (a app tenta criar automaticamente, mas podes criar manualmente).

4. Instala dependências e corre em dev:
   ```bash
   npm install
   npm run dev
   ```

5. Acede a `http://localhost:3000/admin/candidaturas`. Regista/entra com o email definido em `MATIAS_EMAIL`.

## Edge Functions

Deploy:

```bash
# instalar supabase CLI se ainda não tiveres
npm install -g supabase

# login e ligar ao projecto
supabase login
supabase link --project-ref noywnuafpxvxvmfkjtbh

# secrets
supabase secrets set GROQ_API_KEY=<...>
supabase secrets set GMAIL_APP_PASSWORD=<...>
supabase secrets set EMAIL_REMETENTE=suporte@mosalo.eu.cc
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USERNAME=suporte@mosalo.eu.cc

# deploy
supabase functions deploy process-new-job
supabase functions deploy retry-pending-jobs
```

### Webhook no Supabase

Vai a Database → Webhooks → New:
- Table: `external_jobs`
- Events: `INSERT`
- HTTP Request: `POST https://<ref>.supabase.co/functions/v1/process-new-job`
- Headers: `Authorization: Bearer <anon-key>` (o edge function é público por omissão; podes adicionar uma secret de validação se quiseres)

### Cron diário

O `retry-pending-jobs` pode ser invocado por um serviço de cron externo (ex. GitHub Actions, cron-job.org) ou via Supabase Cron/`pg_net`.

Exemplo com curl:

```bash
curl -X POST https://<ref>.supabase.co/functions/v1/retry-pending-jobs \
  -H "Authorization: Bearer <anon-key>"
```

## Testes

```bash
# Testa os 3 cenários contra o Supabase real (sem enviar emails por omissão)
node --env-file=.env.local scripts/test-auto-apply.js

# Para testar o envio real de email no cenário de match bom:
SEND_EMAIL=true node --env-file=.env.local scripts/test-auto-apply.js
```

Cenários:
1. Rigger offshore com email → `enviado` (score alto).
2. Vaga sem email na descrição → `sem_email`.
3. Vaga de software developer → `sem_match` (score baixo).

## Notas de segurança

- O painel `/admin/candidaturas` só é acessível ao email `MATIAS_EMAIL`.
- As tabelas têm RLS e só o `user_id` definido em `admin_config` (key `matias_user_id`) pode aceder directamente.
- Quando o Matias fizer login pela primeira vez, actualiza `admin_config` para o UUID dele no Supabase Auth (ou faz manualmente no SQL Editor).
- O envio de email por Gmail está pendente da verificação do `suporte@mosalo.eu.cc` no Cloudflare Email Routing. Até lá, as candidaturas de match bom serão registadas como `enviado` (com assunto/corpo) mas o email pode falhar.
