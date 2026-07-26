# VDRH Recrutamento

Plataforma de recrutamento premium e multilingue (PT/EN/FR) para a VDRH — Visão e Desenvolvimento de Recursos Humanos.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 3.4
- next-intl (internacionalização com rotas /pt, /en, /fr)
- Framer Motion (animações)
- react-hook-form + Zod (formulários e validação)
- Supabase (vagas dinâmicas e armazenamento de submissões)
- Lucide React

## Funcionalidades

- **Homepage institucional** com missão, visão, valores, objetivos, serviços, estatísticas, depoimento, equipa e parceiros.
- **Página de Serviços** detalhada com todos os serviços VDRH.
- **Página de Carreira** com as 6 vagas fornecidas (requisitos e responsabilidades).
- **Formulário de Candidatura** com seleção de vaga.
- **Pedir Serviço** e **Agendamento** com validação e envio para Supabase.
- **Contactos** com mapa, redes sociais e formulário.
- Dark mode e mobile-first design.
- Cores do branding VDRH: roxo, laranja e preto/slate.

## Desenvolvimento

```bash
npm install
npm run dev
```

A app corre em `http://localhost:3000/pt/`.

## Build estático

```bash
npm run build
```

O output é gerado em `dist/`.

## Supabase

1. Criar projeto em https://supabase.com (ou usar o existente).
2. Copiar `supabase/schema.sql` para o SQL Editor e executar.
3. Ativar **RLS** nas tabelas (incluído no schema) e permitir insert anónimo.
4. Criar `.env.local` com:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

> Nunca expor a `service_role` key no cliente. Use apenas a `anon` key em `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Deploy

O site é exportado como HTML estático. Pode ser deployado em Netlify, Vercel, Cloudflare Pages, AWS S3 ou qualquer CDN. Recomenda-se Netlify tal como o projeto MÔ SALO.

No Netlify, configure:
- Build command: `npm run build`
- Publish directory: `dist`

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key do Supabase |

## Estrutura

```
src/
  app/[locale]/          # Páginas por idioma
  components/              # UI, formulários, animações
  i18n/                    # Configuração next-intl
  lib/supabase.ts          # Cliente Supabase
  messages/                # Traduções PT/EN/FR
public/
  vdrh-logo.png            # Logo da VDRH
supabase/schema.sql        # Schema de base de dados
```

## Notas

- O site usa static export (`output: 'export'`), por isso não é possível usar API Routes ou middleware.
- As traduções estão centralizadas em `src/messages/{pt,en,fr}.json`.
- A root `/` redireciona client-side para `/pt/` (locale por omissão).
