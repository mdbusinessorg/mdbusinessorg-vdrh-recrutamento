import Link from 'next/link';
import { MapPin, Clock, Briefcase, ArrowRight, Star } from 'lucide-react';
import { jobs } from '@/data/site';
import { slugify } from '@/lib/utils';

export function JobsPreview() {
  const featured = jobs.filter((j) => j.featured).slice(0, 3);

  return (
    <section className="section-padding bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
              Oportunidades
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Vagas em destaque
            </h2>
          </div>
          <Link
            href="/vagas/"
            className="group inline-flex items-center gap-2 font-semibold text-vdrh-600 hover:text-vdrh-700 dark:text-vdrh-400 dark:hover:text-vdrh-300"
          >
            Ver todas as vagas
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {featured.map((job) => (
            <Link
              key={job.id}
              href={`/vagas/${slugify(job.title)}-${job.id}/`}
              className="card-hover group relative flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
            >
              {job.featured && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <Star className="h-3 w-3 fill-current" /> Destaque
                </span>
              )}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-vdrh-100 text-vdrh-700 dark:bg-vdrh-900/40 dark:text-vdrh-300">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white group-hover:text-vdrh-600 dark:group-hover:text-vdrh-400">
                {job.title}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {job.company}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                  <MapPin className="h-3 w-3" /> {job.location}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                  <Clock className="h-3 w-3" /> {job.type}
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {job.salary}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-vdrh-600 dark:text-vdrh-400">
                  Candidatar <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
