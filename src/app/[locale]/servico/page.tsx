'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AnimatedSection, AnimatedCard } from '@/components/animated-section';
import { ArrowRight, Check } from 'lucide-react';

export default function ServicesPage() {
  const t = useTranslations('services');
  const tc = useTranslations('common');
  const locale = useLocale();
  const items = t.raw('items') as { title: string; items: string[] }[];
  const testimonials = t.raw('testimonials') as { text: string; author: string }[];

  return (
    <section className="min-h-screen bg-slate-50 pt-28 dark:bg-slate-950">
      <div className="section-padding mx-auto max-w-7xl">
        <AnimatedSection>
          <div className="mb-14 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
              {t('title')}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
              {t('intro')}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {items.map((service, i) => (
            <AnimatedCard key={service.title} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition hover:border-vdrh-300 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-vdrh-700 to-vdrh-500 text-white shadow-lg">
                  {i + 1}
                </div>
                <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
                  {service.title}
                </h2>
                <ul className="space-y-3">
                  {service.items.map((item: string, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Link href={`/${locale}/pedir-servico/`} className="btn-primary text-sm">
                    {tc('requestServiceBtn')}
                  </Link>
                  <Link href={`/${locale}/agendamento/`} className="btn-secondary text-sm">
                    {tc('scheduleBtn')}
                  </Link>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <AnimatedSection delay={0.3}>
          <div className="mt-16 rounded-3xl bg-gradient-to-br from-vdrh-700 to-vdrh-900 p-10 text-center text-white">
            <h2 className="text-2xl font-bold">{t('ctaTitle')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-vdrh-100">{t('ctaText')}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={`/${locale}/pedir-servico/`} className="btn-orange group">
                {tc('requestServiceBtn')}
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link href={`/${locale}/contactos/`} className="btn-secondary border-vdrh-500 bg-transparent text-white hover:bg-vdrh-800">
                {tc('learnMore')}
              </Link>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="mt-20">
            <h2 className="mb-10 text-center text-2xl font-bold text-slate-900 dark:text-white">
              {t('testimonialsTitle')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((item, i) => (
                <AnimatedCard key={i} delay={i * 0.1}>
                  <div className="rounded-3xl border border-slate-100 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-200">
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">— {item.author}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
