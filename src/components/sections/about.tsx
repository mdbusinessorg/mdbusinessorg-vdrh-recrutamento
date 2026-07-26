import { Target, Heart, Shield, Globe } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Empatia',
    text: 'Colocamo-nos no lugar de quem servimos, entendendo necessidades reais.',
  },
  {
    icon: Shield,
    title: 'Integridade',
    text: 'Actuação justa, honesta e transparente, honrando compromissos.',
  },
  {
    icon: Target,
    title: 'Excelência',
    text: 'Perseguimos padrões elevados e impacto duradouro em cada projecto.',
  },
  {
    icon: Globe,
    title: 'Inclusão',
    text: 'Promovemos equidade, diversidade e acesso a oportunidades para todos.',
  },
];

export function About() {
  return (
    <section id="sobre" className="section-padding bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
              Quem Somos
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Visão e Desenvolvimento de Recursos Humanos
            </h2>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              A VDRH é um projecto orientado para a sustentabilidade económica e social. Actuamos
              através de acções e actividades que visam melhorar a qualidade de vida, reduzir
              desigualdades, ampliar direitos e assegurar o acesso a serviços de qualidade.
            </p>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              O nosso objectivo central é elevar a gestão de recursos humanos e desenvolver o
              capital humano das entidades com quem trabalhamos, considerando as gerações presentes
              e futuras. Todos os nossos projectos — comerciais ou sociais — centram-se no bem-estar
              e na sustentabilidade das pessoas e organizações.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((item) => (
              <div
                key={item.title}
                className="card-hover rounded-3xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-vdrh-100 text-vdrh-700 dark:bg-vdrh-900/40 dark:text-vdrh-300">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
