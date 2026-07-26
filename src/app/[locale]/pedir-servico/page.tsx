'use client';

import { useTranslations } from 'next-intl';
import { ContactForm } from '@/components/contact-form';
import { AnimatedSection } from '@/components/animated-section';

export default function RequestServicePage() {
  const t = useTranslations('requestService');
  const serviceOptions = t.raw('form.serviceOptions') as string[];

  return (
    <section className="min-h-screen bg-slate-50 pt-28 dark:bg-slate-950">
      <div className="section-padding mx-auto max-w-3xl">
        <AnimatedSection>
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
              {t('subtitle')}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('title')}
            </h1>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <ContactForm
              table="service_requests"
              successMessage={t('form.success')}
              extraFields={[
                { name: 'company', label: t('form.company') },
                {
                  name: 'service_type',
                  label: t('form.serviceType'),
                  options: serviceOptions,
                },
              ]}
            />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
