import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { siteConfig } from '@/data/site';

export function CTA() {
  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white dark:from-slate-950 dark:to-slate-900">
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-vdrh-500/20 blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Pronto para contratar ou encontrar a vaga certa?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Junte-se à plataforma que está a redefinir o recrutamento em Angola. Candidatos e
          empresas, todos num só lugar.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/vagas/" className="btn-primary group bg-white text-slate-900 hover:bg-slate-100">
            Ver Vagas Agora
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <a
            href={siteConfig.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary border-slate-600 bg-transparent text-white hover:bg-slate-800"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Sou Recrutador
          </a>
        </div>
      </div>
    </section>
  );
}
