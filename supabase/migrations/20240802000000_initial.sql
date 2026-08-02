-- Módulo privado de Candidatura Automática
-- Projecto: MÔ SALO — Matias

-- 1. Tabela de vagas externas (fonte do scraping; replica a estrutura esperada do angolaemprego.com)

create table if not exists external_jobs (
  id uuid primary key default gen_random_uuid(),
  title text,
  company text,
  location text,
  description text,
  contact_info text,
  requirements text,
  url text,
  source text default 'angolaemprego.com',
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Configuração de admin: define o UUID do Matias que acessa tudo

create table if not exists admin_config (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  updated_at timestamptz default now()
);

insert into admin_config (key, value)
values ('matias_user_id', '00000000-0000-0000-0000-000000000000')
on conflict (key) do update set value = excluded.value;

-- 3. Perfil do Matias

create table if not exists candidate_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  full_name text not null,
  bio_longa text not null,
  formacao text,
  certificacoes jsonb default '[]'::jsonb,
  skills jsonb default '[]'::jsonb,
  referencias jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- 4. CVs

create table if not exists candidate_cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  titulo text not null,
  cargo_alvo text not null,
  arquivo_url text not null,
  skills_cobertas jsonb default '[]'::jsonb,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- 5. Log de candidaturas

create table if not exists job_applications_log (
  id uuid primary key default gen_random_uuid(),
  external_job_id uuid references external_jobs(id) not null,
  status text not null check (status in ('enviado','sem_email','sem_match','erro','duplicado')),
  cv_usado_id uuid references candidate_cvs(id),
  email_destino text,
  assunto_email text,
  corpo_email text,
  score_match numeric,
  skills_destacadas jsonb,
  erro_detalhe text,
  created_at timestamptz default now(),
  unique(external_job_id)
);

-- 6. Configurações do módulo

create table if not exists auto_apply_settings (
  id uuid primary key default gen_random_uuid(),
  ativo boolean default true,
  score_minimo numeric default 55,
  limite_diario integer default 15,
  email_remetente text default 'suporte@mosalo.eu.cc',
  updated_at timestamptz default now()
);

insert into auto_apply_settings (id, ativo, score_minimo, limite_diario, email_remetente)
values (gen_random_uuid(), true, 55, 15, 'suporte@mosalo.eu.cc')
on conflict do nothing;

-- 7. RLS: tudo fechado por omissão

alter table external_jobs enable row level security;
alter table candidate_profile enable row level security;
alter table candidate_cvs enable row level security;
alter table job_applications_log enable row level security;
alter table auto_apply_settings enable row level security;
alter table admin_config enable row level security;

-- Apenas o user_id do Matias (definido em admin_config) pode ler/alterar

create or replace function get_admin_user_id()
returns uuid as $$
declare
  uid uuid;
begin
  select value::uuid into uid from admin_config where key = 'matias_user_id';
  return uid;
end;
$$ language plpgsql security definer;

create or replace function is_admin_user(p_user_id uuid)
returns boolean as $$
begin
  return p_user_id is not null and p_user_id = get_admin_user_id();
end;
$$ language plpgsql security definer;

-- Policies para candidate_profile

create policy "candidate_profile_admin_select"
  on candidate_profile for select
  using (is_admin_user(auth.uid()));

create policy "candidate_profile_admin_all"
  on candidate_profile for all
  using (is_admin_user(auth.uid()));

-- Policies para candidate_cvs

create policy "candidate_cvs_admin_select"
  on candidate_cvs for select
  using (is_admin_user(auth.uid()));

create policy "candidate_cvs_admin_all"
  on candidate_cvs for all
  using (is_admin_user(auth.uid()));

-- Policies para job_applications_log

create policy "job_applications_log_admin_select"
  on job_applications_log for select
  using (is_admin_user(auth.uid()));

create policy "job_applications_log_admin_all"
  on job_applications_log for all
  using (is_admin_user(auth.uid()));

-- Policies para auto_apply_settings

create policy "auto_apply_settings_admin_select"
  on auto_apply_settings for select
  using (is_admin_user(auth.uid()));

create policy "auto_apply_settings_admin_all"
  on auto_apply_settings for all
  using (is_admin_user(auth.uid()));

-- Policies para admin_config

create policy "admin_config_admin_select"
  on admin_config for select
  using (is_admin_user(auth.uid()));

create policy "admin_config_admin_all"
  on admin_config for all
  using (is_admin_user(auth.uid()));

-- external_jobs legível pelo admin para auditoria

create policy "external_jobs_admin_select"
  on external_jobs for select
  using (is_admin_user(auth.uid()));

-- Extensão necessária para o cron (se disponível; o daily retry pode ser agendado via Supabase Cron ou CRON externo)

create extension if not exists pg_cron with schema extensions;

comment on table candidate_profile is 'Perfil estendido do Matias';
comment on table candidate_cvs is 'CVs disponíveis para auto-candidatura';
comment on table job_applications_log is 'Auditoria de candidaturas automáticas';
comment on table auto_apply_settings is 'Configuração do módulo de candidatura automática';
