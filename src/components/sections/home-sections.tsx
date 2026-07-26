'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AnimatedSection, AnimatedCard } from '@/components/animated-section';
import { ArrowRight } from 'lucide-react';

export function HomeServices() {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <section id="servicos" className="section-padding bg-slate-50 dark:bg-slate-900/30">
      <div className="mx-auto max-w-7xl">
        <AnimatedSection>
          <div className="mb-14 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
              {t('servicesTitle')}
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('servicesTitle')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">{t('servicesIntro')}</p>
          </div>
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(t.raw('servicesCards') as { title: string; text: string }[]).map((service, i) => (
            <AnimatedCard key={service.title} delay={i * 0.15}>
              <div className="group h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition hover:border-vdrh-300 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-vdrh-700 to-vdrh-500 text-white shadow-lg shadow-vdrh-500/25 transition group-hover:scale-110">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">{service.title}</h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">{service.text}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <AnimatedSection delay={0.4}>
          <div className="mt-12 text-center">
            <Link href={`/${locale}/servico/`} className="btn-primary group">
              {tc('learnMore')}
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export function HomeStats() {
  const t = useTranslations('home');
  const stats = t.raw('stats') as { label: string; value: string; suffix?: string }[];

  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-br from-vdrh-800 to-vdrh-950 text-white">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange-500/20 blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-vdrh-400/20 blur-[80px]" />

      <div className="relative mx-auto max-w-7xl">
        <AnimatedSection>
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">{t('statsTitle')}</h2>
        </AnimatedSection>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <AnimatedCard key={stat.label} delay={index * 0.1}>
              <div className="text-center">
                <p className="text-5xl font-extrabold tracking-tight">
                  {stat.value}
                  <span className="text-orange-400">{stat.suffix || ''}</span>
                </p>
                <p className="mt-2 text-sm font-medium text-vdrh-100">{stat.label}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeQuote() {
  const t = useTranslations('home');

  return (
    <section className="section-padding bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-4xl">
        <AnimatedSection>
          <div className="relative rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-10 text-white shadow-2xl shadow-orange-500/20 md:p-16">
            <div className="absolute -right-4 -top-4 text-8xl font-serif opacity-20">&ldquo;</div>
            <blockquote className="relative z-10 text-xl font-medium leading-relaxed md:text-2xl">
              {t('quote')}
            </blockquote>
            <div className="relative z-10 mt-8">
              <p className="font-semibold">{t('quoteAuthor')}</p>
              <p className="text-sm text-orange-100">{t('quoteRole')}</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export function HomeTeam() {
  const t = useTranslations('home');
  const team = t.raw('team') as { name: string; role: string }[];

  return (
    <section id="equipa" className="section-padding bg-slate-50 dark:bg-slate-900/30">
      <div className="mx-auto max-w-7xl">
        <AnimatedSection>
          <div className="mb-14 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
              {t('teamTitle')}
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('teamTitle')}
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <AnimatedCard key={member.name} delay={i * 0.1}>
              <div className="rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="relative mx-auto mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-vdrh-100 to-vdrh-200 dark:from-vdrh-900 dark:to-vdrh-800">
                  <div className="flex h-full items-center justify-center text-4xl font-bold text-vdrh-700 dark:text-vdrh-300">
                    {member.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
