'use client';

import { useTranslations } from 'next-intl';
import { HomeHero } from '@/components/sections/home-hero';
import { AnimatedSection, AnimatedCard } from '@/components/animated-section';
import { HomeServices, HomeStats, HomeQuote, HomeTeam } from '@/components/sections/home-sections';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <>
      <HomeHero />

      <section id="sobre" className="section-padding bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection>
            <div className="mb-12 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
                {t('aboutTitle')}
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {t('aboutTitle')}
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid gap-12 lg:grid-cols-2">
            <AnimatedSection delay={0.1}>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  {t('aboutIntro')}
                </p>
                <div className="rounded-2xl bg-vdrh-50 p-6 dark:bg-vdrh-900/20">
                  <p className="font-semibold text-vdrh-900 dark:text-vdrh-100">
                    MOVE Capital Humano — Talentos & Valores para o Crescimento Organizacional
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="space-y-8">
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                    {t('missionTitle')}
                  </h3>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-300">{t('missionText')}</p>
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                    {t('visionTitle')}
                  </h3>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-300">{t('visionText')}</p>
                </div>
              </div>
            </AnimatedSection>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(t.raw('objectives') as string[]).map((objective: string, i: number) => (
              <AnimatedCard key={i} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{objective}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <div className="mt-16">
            <AnimatedSection>
              <h3 className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white">
                {t('valuesTitle')}
              </h3>
            </AnimatedSection>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(t.raw('values') as { title: string; text: string }[]).map((value, i) => (
                <AnimatedCard key={value.title} delay={i * 0.1}>
                  <div className="h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-vdrh-300 dark:border-slate-800 dark:bg-slate-950">
                    <h4 className="mb-2 text-lg font-semibold text-vdrh-700 dark:text-vdrh-300">{value.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{value.text}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HomeServices />
      <HomeStats />
      <HomeQuote />
      <HomeTeam />
    </>
  );
}
