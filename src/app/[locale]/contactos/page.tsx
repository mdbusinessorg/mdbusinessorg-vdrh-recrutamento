'use client';

import { useTranslations } from 'next-intl';
import { ContactForm } from '@/components/contact-form';
import { AnimatedSection } from '@/components/animated-section';
import { MapPin, Phone, Mail, Clock, Facebook, Linkedin, Instagram } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const tc = useTranslations('common');

  return (
    <section className="min-h-screen bg-slate-50 pt-28 dark:bg-slate-950">
      <div className="section-padding mx-auto max-w-7xl">
        <AnimatedSection>
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
              {t('title')}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('title')}
            </h1>
          </div>
        </AnimatedSection>

        <div className="grid gap-12 lg:grid-cols-2">
          <AnimatedSection delay={0.1}>
            <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
              <ContactInfo icon={MapPin} title={t('locationTitle')} text={tc('address')} />
              <ContactInfo icon={Clock} title={t('scheduleTitle')} text={tc('scheduleTime')} />
              <ContactInfo icon={Phone} title={t('supportTitle')} text={tc('phone')} />
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-vdrh-100 text-vdrh-700 dark:bg-vdrh-900/40 dark:text-vdrh-300">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Email</h3>
                  <a href={`mailto:${tc('email')}`} className="text-vdrh-600 hover:underline dark:text-vdrh-400">
                    {tc('email')}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <SocialLink href="https://www.facebook.com/profile.php?id=61587068392038" icon={Facebook} />
                <SocialLink href="https://www.linkedin.com/company/vdrh-lda/" icon={Linkedin} />
                <SocialLink href="https://www.instagram.com/vdrh.lda/" icon={Instagram} />
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31527.2056093873!2d13.177!3d-8.922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a51f24ec1c3a8c7%3A0x1234567890abcdef!2sMulticenter%2C%20Camama%2C%20Luanda!5e0!3m2!1spt!2sao!4v1700000000000!5m2!1spt!2sao"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa"
                />
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
              <ContactForm table="contacts" successMessage={t('form.success')} />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function ContactInfo({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-vdrh-100 text-vdrh-700 dark:bg-vdrh-900/40 dark:text-vdrh-300">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: React.ElementType }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-vdrh-600 p-3 text-white transition hover:bg-vdrh-700"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}
