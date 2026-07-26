import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Facebook, Linkedin, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const locale = useLocale();
  const t = useTranslations('common');
  const nav = useTranslations('nav');

  return (
    <footer className="border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" id="contactos">
      <div className="section-padding mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/vdrh-logo.png" alt="VDRH" width={40} height={40} className="h-9 w-auto" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">VDRH</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t('address')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61587068392038"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:text-vdrh-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-vdrh-400"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/vdrh-lda/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:text-vdrh-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-vdrh-400"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/vdrh.lda/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:text-vdrh-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-vdrh-400"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">{nav('home')}</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link href={`/${locale}/`} className="hover:text-vdrh-600">{nav('home')}</Link>
              </li>
              <li>
                <Link href={`/${locale}/servico/`} className="hover:text-vdrh-600">{nav('services')}</Link>
              </li>
              <li>
                <Link href={`/${locale}/carreira/`} className="hover:text-vdrh-600">{nav('career')}</Link>
              </li>
              <li>
                <Link href={`/${locale}/contactos/`} className="hover:text-vdrh-600">{nav('contact')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">{nav('services')}</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link href={`/${locale}/pedir-servico/`} className="hover:text-vdrh-600">{nav('requestService')}</Link>
              </li>
              <li>
                <Link href={`/${locale}/agendamento/`} className="hover:text-vdrh-600">{nav('schedule')}</Link>
              </li>
              <li>
                <Link href={`/${locale}/candidatura/`} className="hover:text-vdrh-600">{nav('apply')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">{nav('contact')}</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-vdrh-600" />
                {t('address')}
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-vdrh-600" />
                {t('scheduleTime')}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-vdrh-600" />
                {t('phone')}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-vdrh-600" />
                <a href={`mailto:${t('email')}`} className="hover:text-vdrh-600">
                  {t('email')}
                </a>
              </li>
            </ul>
            <a
              href={t('whatsappLink')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6 w-full text-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          <p>MOVE Capital Humano — Talentos & Valores para o Crescimento Organizacional</p>
        </div>
      </div>
    </footer>
  );
}
