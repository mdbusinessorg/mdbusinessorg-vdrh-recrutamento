'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Clock,
  Briefcase,
  ArrowRight,
  Star,
  Filter,
  X,
} from 'lucide-react';
import { jobs } from '@/data/site';
import { slugify, cn } from '@/lib/utils';

const types = Array.from(new Set(jobs.map((j) => j.type)));
const locations = Array.from(new Set(jobs.map((j) => j.location.split(' ')[0])));

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('Todos');
  const [location, setLocation] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchesQuery =
        query.trim() === '' ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase());
      const matchesType = type === 'Todos' || job.type === type;
      const matchesLocation =
        location === 'Todos' || job.location.toLowerCase().includes(location.toLowerCase());
      return matchesQuery && matchesType && matchesLocation;
    });
  }, [query, type, location]);

  return (
    <section className="min-h-screen bg-slate-50 pt-28 dark:bg-slate-950">
      <div className="section-padding mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
            Oportunidades
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Vagas de Emprego
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
            Encontre a próxima etapa da sua carreira ou da sua empresa.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cargo, empresa ou palavra-chave..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {['Todos', ...types].slice(0, 4).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm font-medium transition',
                      type === t
                        ? 'bg-vdrh-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Filter className="h-4 w-4" /> Filtros
              </button>
            </div>

            {showFilters && (
              <div className="grid gap-4 rounded-2xl border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tipo de contrato
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {['Todos', ...types].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Localização
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {['Todos', ...locations].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} vaga{filtered.length !== 1 && 's'} encontrada
            {filtered.length !== 1 && 's'}
          </p>

          <div className="mt-6 grid gap-5">
            {filtered.map((job) => (
              <Link
                key={job.id}
                href={`/vagas/${slugify(job.title)}-${job.id}/`}
                className="group flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-vdrh-600 dark:text-white dark:group-hover:text-vdrh-400">
                      {job.title}
                    </h3>
                    {job.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        <Star className="h-3 w-3 fill-current" /> Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {job.company}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                      <Clock className="h-3 w-3" /> {job.type}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                      <Briefcase className="h-3 w-3" /> {job.salary}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-vdrh-50 px-4 py-2 text-sm font-semibold text-vdrh-700 transition group-hover:bg-vdrh-600 group-hover:text-white dark:bg-vdrh-900/30 dark:text-vdrh-300 dark:group-hover:bg-vdrh-500">
                    Ver vaga <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
                <p className="text-slate-500 dark:text-slate-400">Nenhuma vaga encontrada.</p>
                <button
                  onClick={() => {
                    setQuery('');
                    setType('Todos');
                    setLocation('Todos');
                  }}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-vdrh-600 hover:underline dark:text-vdrh-400"
                >
                  <X className="h-4 w-4" /> Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
