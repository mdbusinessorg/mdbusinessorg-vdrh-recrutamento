'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';

export function HomeHero() {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-vdrh-400/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      <div className="section-padding mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-vdrh-200 bg-vdrh-50 px-4 py-1.5 text-sm font-medium text-vdrh-700 dark:border-vdrh-800 dark:bg-vdrh-900/30 dark:text-vdrh-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vdrh-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-vdrh-600" />
              </span>
              VDRH Angola
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {t('heroText')}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/pedir-servico/`} className="btn-primary group">
                {tc('requestServiceBtn')}
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link href={`/${locale}/agendamento/`} className="btn-orange group">
                {tc('scheduleBtn')}
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:flex lg:justify-center"
          >
            <div className="relative rounded-3xl border border-white/20 bg-white/60 p-10 shadow-2xl backdrop-blur-xl dark:bg-slate-900/60 dark:border-slate-700/30">
              <Image
                src="/vdrh-logo.png"
                alt="VDRH"
                width={320}
                height={320}
                className="mx-auto h-auto w-64"
              />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 -top-6 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-800"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">Serviços</p>
                <p className="text-2xl font-bold text-vdrh-700 dark:text-vdrh-300">12</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
