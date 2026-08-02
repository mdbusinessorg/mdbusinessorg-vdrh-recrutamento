'use client';

import Link from 'next/link';
import { ArrowRight, Search, Sparkles, Users, Building2 } from 'lucide-react';
import { siteConfig } from '@/data/site';

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-vdrh-400/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      <div className="section-padding mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-vdrh-200 bg-vdrh-50 px-4 py-1.5 text-sm font-medium text-vdrh-700 dark:border-vdrh-800 dark:bg-vdrh-900/30 dark:text-vdrh-300">
              <Sparkles className="h-4 w-4" />
              <span>Nova plataforma de recrutamento em Angola</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              MOVE Capital Humano com a{' '}
              <span className="gradient-text">{siteConfig.name}</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Conectamos talentos de excelência às melhores empresas de Angola. Recrutamento
              inteligente, diversidade e desenvolvimento do capital humano numa só plataforma.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/vagas/" className="btn-primary group">
                Explorar Vagas
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                Sou Empresa
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Users className="h-4 w-4" />
                </div>
                <span>+3.500 candidatos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <span>+85 empresas parceiras</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl border border-white/20 bg-white/60 p-8 shadow-2xl backdrop-blur-xl dark:bg-slate-900/60 dark:border-slate-700/30">
              <div className="absolute -left-8 -top-8 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                    <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Vagas ativas</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">120+</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-vdrh-600 to-vdrh-500 p-6 text-white shadow-lg">
                  <h3 className="text-xl font-bold">Recrutamento Inteligente</h3>
                  <p className="mt-2 text-sm text-vdrh-50">
                    Match por IA, ranking de candidatos e triagem automatizada para contratar melhor e mais rápido.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800">
                    <p className="text-3xl font-bold text-vdrh-600 dark:text-vdrh-400">92%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Satisfação</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800">
                    <p className="text-3xl font-bold text-accent">3.5k</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Talentos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
