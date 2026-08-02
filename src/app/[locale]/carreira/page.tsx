'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AnimatedSection, AnimatedCard } from '@/components/animated-section';
import { ArrowRight, Briefcase, Check } from 'lucide-react';

export default function CareerPage() {
  const t = useTranslations('career');
  const tc = useTranslations('common');
  const locale = useLocale();
  const jobs = t.raw('jobs') as { title: string; requirements: string[]; responsibilities: string }[];

  return (
    <section className="min-h-screen bg-slate-50 pt-28 dark:bg-slate-950">
      <div className="section-padding mx-auto max-w-7xl">
        <AnimatedSection>
          <div className="mb-14 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
              {t('subtitle')}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">{t('intro')}</p>
          </div>
        </AnimatedSection>

        <div className="grid gap-6">
          {jobs.map((job, i) => (
            <AnimatedCard key={job.title} delay={i * 0.1}>
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-vdrh-300 dark:border-slate-800 dark:bg-slate-900/70 md:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vdrh-100 text-vdrh-700 dark:bg-vdrh-900/40 dark:text-vdrh-300">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{job.title}</h2>
                    </div>

                    <h3 className="mb-2 text-sm font-semibold uppercase text-vdrh-600 dark:text-vdrh-400">
                      Requisitos
                    </h3>
                    <ul className="mb-4 space-y-2">
                      {job.requirements.map((req, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                          {req}
                        </li>
                      ))}
                    </ul>

                    <h3 className="mb-2 text-sm font-semibold uppercase text-vdrh-600 dark:text-vdrh-400">
                      Responsabilidades
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {job.responsibilities}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Link href={`/${locale}/candidatura/`} className="btn-primary group text-sm">
                      {tc('applyNow')}
                      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
