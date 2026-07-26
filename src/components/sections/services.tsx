import { Search, Users, HeartHandshake, ShieldCheck, TrendingUp, Briefcase } from 'lucide-react';
import { services } from '@/data/site';

const iconMap: Record<string, React.ElementType> = {
  Search,
  Users,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
  Briefcase,
};

export function Services() {
  return (
    <section id="servicos" className="section-padding bg-slate-50 dark:bg-slate-900/30">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
            O que fazemos
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Soluções completas de RH
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
            Cobrimos as necessidades de recursos humanos de ponta a ponta, desde o recrutamento
            estratégico até à transformação cultural.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Briefcase;
            return (
              <div
                key={index}
                className="card-hover group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-vdrh-500 to-vdrh-700 text-white shadow-lg shadow-vdrh-500/25 transition group-hover:scale-110">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
