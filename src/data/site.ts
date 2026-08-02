export const siteConfig = {
  name: 'VDRH',
  fullName: 'Visão e Desenvolvimento de Recursos Humanos',
  slogan: 'MOVE Capital Humano — Talentos & Valores para o Crescimento Organizacional',
  phone: '+244 923 789 748',
  email: 'geral@vdrh.ao',
  address: 'Multicenter, Camama, Luanda, Angola',
  whatsapp: 'https://wa.link/1m7xru',
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61587068392038',
    linkedin: 'https://www.linkedin.com/company/vdrh-lda/',
    instagram: 'https://www.instagram.com/vdrh.lda/',
  },
};

export const stats = [
  { value: '120+', label: 'Vagas Publicadas', suffix: '' },
  { value: '3.5k', label: 'Candidatos', suffix: '+' },
  { value: '85', label: 'Empresas Parceiras', suffix: '+' },
  { value: '92', label: 'Taxa de Satisfação', suffix: '%' },
];

export const services = [
  {
    title: 'Desenvolvimento de Talentos',
    description:
      'Programas de capacitação contínua, coaching de liderança e planos de carreira alinhados à estratégia do negócio.',
    icon: 'Users',
  },
  {
    title: 'Diversidade, Inclusão e Equidade',
    description:
      'Estratégias para construir ambientes de trabalho plural, justo e representativo, com indicadores mensuráveis.',
    icon: 'HeartHandshake',
  },
  {
    title: 'Conformidade e Governança',
    description:
      'Auditoria de RH, políticas internas, compliance trabalhista e alinhamento à legislação angolana.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Recrutamento & Seleção',
    description:
      'Processos seletivos de ponta a ponta, employer branding e triagem inteligente por IA para reduzir tempo de contratação.',
    icon: 'Search',
  },
  {
    title: 'Avaliação de Desempenho',
    description:
      'Modelos de avaliação 360°, OKRs e feedback contínuo para elevar a produtividade das equipas.',
    icon: 'TrendingUp',
  },
  {
    title: 'Consultoria Estratégica',
    description:
      'Diagnóstico organizacional, plano de pessoal e transformação cultural orientados por dados.',
    icon: 'Briefcase',
  },
];

export const team = [
  {
    name: 'Dr.ª Verónica Mabanga',
    role: 'Consultora Sénior & Fundadora',
    image: 'https://vdrh.ao/wp-content/uploads/elementor/thumbs/vdrh_-_oliver_michelle-rjkt3pla9fh3xg6xxtpnhxysz3a1fwk7oqij0vhiis.webp',
    linkedin: 'https://www.linkedin.com/company/vdrh-lda/',
  },
  {
    name: 'Joana Manassas',
    role: 'Coord. Recursos Humanos',
    image: 'https://vdrh.ao/wp-content/uploads/2026/05/l.jpg',
    linkedin: 'https://www.linkedin.com/company/vdrh-lda/',
  },
  {
    name: 'Ana Africano',
    role: 'Assistente Jurídica',
    image: 'https://vdrh.ao/wp-content/uploads/2026/02/IMG_1584-scaled.webp',
    linkedin: 'https://www.linkedin.com/company/vdrh-lda/',
  },
  {
    name: 'Cristina Armísio',
    role: 'Assistente de Projecto',
    image: 'https://vdrh.ao/wp-content/uploads/2026/02/IMG_1580-scaled.webp',
    linkedin: 'https://www.linkedin.com/company/vdrh-lda/',
  },
  {
    name: 'Isabel Diogo',
    role: 'Assistente Administrativa',
    image: 'https://vdrh.ao/wp-content/uploads/2026/02/IMG_1602-scaled.webp',
    linkedin: 'https://www.linkedin.com/company/vdrh-lda/',
  },
];

export const testimonials = [
  {
    text: 'A VDRH conseguiu entender a nossa cultura e trouxe candidatos que realmente se encaixaram. Reduzimos o turnover em 40%.',
    author: 'Ricardo Mendes',
    role: 'Diretor de RH, Privalia',
  },
  {
    text: 'Plataforma intuitiva e processo de candidatura rápido. Em menos de duas semanas estava a trabalhar na minha área de formação.',
    author: 'Ana Silva',
    role: 'Candidata aprovada',
  },
  {
    text: 'O suporte na diversidade e inclusão transformou a nossa política de contratação. Profissionalismo exemplar.',
    author: 'Dr.ª Catarina Lopes',
    role: 'CEO, CoDigital',
  },
];

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Tempo inteiro' | 'Meio período' | 'Freelancer' | 'Estágio' | 'Remoto';
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: string;
  expiresAt: string;
  featured: boolean;
}

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Coordenador(a) de Recursos Humanos',
    company: 'VDRH',
    location: 'Luanda',
    type: 'Tempo inteiro',
    salary: 'A combinar',
    description:
      'Liderar processos de recrutamento, desenvolvimento e retenção de talentos para clientes nacionais e internacionais.',
    requirements: [
      'Licenciatura em Gestão de Recursos Humanos ou área afim',
      'Mínimo 5 anos de experiência em coordenação de RH',
      'Domínio de legislação laboral angolana',
      'Inglês fluente (diferencial)',
    ],
    benefits: [
      'Salário competitivo',
      'Seguro de saúde',
      'Plano de desenvolvimento',
      'Ambiente inclusivo',
    ],
    postedAt: '2026-07-20',
    expiresAt: '2026-08-20',
    featured: true,
  },
  {
    id: '2',
    title: 'Analista de Dados de RH',
    company: 'CoDigital',
    location: 'Luanda (Híbrido)',
    type: 'Tempo inteiro',
    salary: '500.000 Kz - 800.000 Kz',
    description:
      'Transformar dados de pessoas em insights acionáveis, construindo dashboards e indicadores para decisões estratégicas.',
    requirements: [
      'Formação em Estatística, Informática ou afins',
      'Experiência com Power BI, SQL ou Python',
      'Conhecimento em People Analytics',
      'Pensamento crítico e orientação a resultados',
    ],
    benefits: ['Horário flexível', 'Trabalho híbrido', 'Bónus por desempenho', 'Formação contínua'],
    postedAt: '2026-07-22',
    expiresAt: '2026-08-22',
    featured: true,
  },
  {
    id: '3',
    title: 'Assistente Jurídico(a) Trabalhista',
    company: 'VDRH',
    location: 'Luanda',
    type: 'Tempo inteiro',
    salary: 'A combinar',
    description:
      'Apoiar a equipa na conformidade trabalhista, revisão de contratos e pareceres jurídicos para clientes corporativos.',
    requirements: [
      'Licenciatura em Direito',
      'Experiência em direito laboral (mínimo 2 anos)',
      'Excelente redação e argumentação',
      'Proatividade e ética profissional',
    ],
    benefits: ['Integração sólida', 'Plano de carreira', 'Seguro de saúde', 'Ambiente colaborativo'],
    postedAt: '2026-07-24',
    expiresAt: '2026-08-24',
    featured: false,
  },
  {
    id: '4',
    title: 'Consultor(a) de Diversidade & Inclusão',
    company: 'Privalia',
    location: 'Luanda',
    type: 'Freelancer',
    salary: 'Por projeto',
    description:
      'Diagnosticar práticas de D&I, elaborar planos de ação e acompanhar métricas de inclusão em organizações parceiras.',
    requirements: [
      'Experiência comprovada em projetos de D&I',
      'Excelente comunicação e facilitação',
      'Capacidade de trabalhar com dados',
      'Inglês ou francês (diferencial)',
    ],
    benefits: ['Projetos desafiantes', 'Rede de parceiros', 'Flexibilidade', 'Reconhecimento no sector'],
    postedAt: '2026-07-25',
    expiresAt: '2026-08-25',
    featured: false,
  },
  {
    id: '5',
    title: 'Gestor(a) de Talentos Jr.',
    company: 'VDRH',
    location: 'Luanda',
    type: 'Estágio',
    salary: 'Bolsa mensal',
    description:
      'Apoiar o ciclo completo de recrutamento, employer branding e experiência do candidato em uma consultoria em crescimento.',
    requirements: [
      'Estudante finalista ou recém-graduado em RH/Psicologia/Gestão',
      'Bom domínio de ferramentas Office e redes sociais',
      'Proatividade e vontade de aprender',
      'Disponibilidade imediata',
    ],
    benefits: ['Mentoria especializada', 'Bolsa competitiva', 'Possibilidade de contratação', 'Networking'],
    postedAt: '2026-07-26',
    expiresAt: '2026-08-26',
    featured: true,
  },
  {
    id: '6',
    title: 'Especialista em Employer Branding',
    company: 'Mota-Engil',
    location: 'Luanda',
    type: 'Tempo inteiro',
    salary: 'A combinar',
    description:
      'Construir a marca empregadora, criar conteúdo para atração de talentos e gerir a presença digital da empresa.',
    requirements: [
      'Formação em Marketing, Comunicação ou RH',
      'Experiência em employer branding ou marketing digital',
      'Criatividade e domínio de métricas',
      'Inglês fluente',
    ],
    benefits: ['Pacote salarial atrativo', 'Benefícios familiares', 'Desenvolvimento internacional', 'Seguro'],
    postedAt: '2026-07-26',
    expiresAt: '2026-08-30',
    featured: false,
  },
];
