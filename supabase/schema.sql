-- Schema VDRH Recrutamento (Supabase)
-- Execute no SQL Editor do Supabase project gwnjigmsuqasvotsksmk

-- Vagas publicadas
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'pt',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  responsibilities TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pedidos de serviço
CREATE TABLE IF NOT EXISTS service_requests (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service_type TEXT,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'pt',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  preferred_date DATE,
  preferred_time TIME,
  consultancy_type TEXT,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'pt',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Candidaturas
CREATE TABLE IF NOT EXISTS job_applications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT,
  cover_letter TEXT,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'pt',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contactos
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'pt',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Política RLS: permite insert anónimo e select só por auth users (ex.: dashboard)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS allow_insert_jobs ON jobs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS allow_select_jobs ON jobs FOR SELECT TO anon USING (is_active = true);
CREATE POLICY IF NOT EXISTS allow_insert_service_requests ON service_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS allow_select_service_requests ON service_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS allow_insert_bookings ON bookings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS allow_select_bookings ON bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS allow_insert_job_applications ON job_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS allow_select_job_applications ON job_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS allow_insert_contacts ON contacts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS allow_select_contacts ON contacts FOR SELECT TO authenticated USING (true);

-- Inserir vagas iniciais (mesmas do site original)
INSERT INTO jobs (slug, title, requirements, responsibilities, is_active) VALUES
('assistente-recursos-humanos', 'Assistente de Recursos Humanos', ARRAY['Licenciatura em Gestão de Recursos Humanos ou área relacionada','Conhecimento de legislação laboral angolana','Boa capacidade de comunicação e organização','Experiência mínima de 1 ano (preferencial)'], 'Apoiar a gestão de processos de recrutamento e seleção; manter fichas de colaboradores; responder a questões laborais internas; organizar processos admissionais e demissionais.', true),
('recrutador-talentos', 'Recrutador de Talentos', ARRAY['Experiência comprovada em recrutamento e seleção','Domínio de sourcing via LinkedIn, bases de dados e job boards','Perfil comercial e orientado a resultados','Capacidade de avaliação técnica e comportamental'], 'Identificar talentos para clientes; conduzir entrevistas; gerir pipeline de candidatos; acompanhar integração e feedback.', true),
('consultor-desenvolvimento-organizacional', 'Consultor de Desenvolvimento Organizacional', ARRAY['Formação superior em Psicologia, RH, Gestão ou similar','Experiência em diagnóstico organizacional e desenvolvimento de equipas','Conhecimento em instrumentos de avaliação de desempenho','Inglês técnico (valorizado)'], 'Realizar diagnósticos organizacionais; propor planos de desenvolvimento; facilitar workshops e formações; acompanhar KPIs de RH.', true),
('especialista-compensacoes-beneficios', 'Especialista em Compensações e Benefícios', ARRAY['Experiência em gestão salarial e benefícios','Conhecimento de práticas de remuneração em Angola','Domínio de Excel e ferramentas de análise','Pensamento analítico e rigor'], 'Gerir políticas de compensação; analisar estruturas salariais; assegurar conformidade fiscal e contributiva; elaborar relatórios de custos.', true),
('gestor-relacoes-cliente', 'Gestor de Relações com Cliente', ARRAY['Experiência em account management ou vendas B2B','Excelentes competências de comunicação e negociação','Conhecimento do setor de RH e recrutamento','Proatividade e foco em KPIs comerciais'], 'Gerir carteira de clientes; identificar oportunidades de negócio; coordenar entregas com a equipa operacional; assegurar satisfação e retenção.', true),
('analista-dados-rh', 'Analista de Dados de RH', ARRAY['Formação em Data Science, Estatística, Informática ou similar','Experiência em análise de dados de RH','Domínio de SQL, Python e/ou ferramentas de BI','Raciocínio lógico e atenção ao detalhe'], 'Coletar e analisar dados de RH; construir dashboards; apoiar decisões estratégicas com insights; automatizar relatórios periódicos.', true)
ON CONFLICT (slug) DO NOTHING;
