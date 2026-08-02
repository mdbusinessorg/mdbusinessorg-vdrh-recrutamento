import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { jobs } from '@/data/site';
import { slugify } from '@/lib/utils';
import { JobApplyForm } from '@/components/job-apply-form';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return jobs.map((job) => ({
    slug: `${slugify(job.title)}-${job.id}`,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const job = findJob(slug);
  if (!job) return {};
  return {
    title: `${job.title} | ${job.company} — VDRH Recrutamento`,
    description: job.description,
  };
}

function findJob(slug: string) {
  const id = slug.split('-').pop();
  return jobs.find((j) => j.id === id);
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = findJob(slug);
  if (!job) notFound();

  return (
    <section className="min-h-screen bg-slate-50 pt-28 dark:bg-slate-950">
      <div className="section-padding mx-auto max-w-5xl">
        <Link
          href="/vagas/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-vdrh-600 dark:text-slate-400 dark:hover:text-vdrh-400"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar às vagas
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {job.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <Sparkles className="h-3 w-3" /> Vaga em destaque
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-vdrh-50 px-2.5 py-1 text-xs font-semibold text-vdrh-700 dark:bg-vdrh-900/30 dark:text-vdrh-300">
                  <Clock className="h-3 w-3" /> {job.type}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {job.title}
              </h1>
              <p className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-300">
                {job.company}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                  <MapPin className="h-4 w-4" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                  <Briefcase className="h-4 w-4" /> {job.salary}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                  <Calendar className="h-4 w-4" /> Publicado em {job.postedAt}
                </span>
              </div>

              <div className="mt-8 space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Descrição
                  </h2>
                  <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
                    {job.description}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Requisitos
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {job.requirements.map((req, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-slate-600 dark:text-slate-300"
                      >
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-vdrh-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Benefícios
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {job.benefits.map((ben, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-slate-600 dark:text-slate-300"
                      >
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                        {ben}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
              <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
                Candidatar-se
              </h2>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
                Preencha os dados abaixo. A nossa IA irá analisar o teu perfil e comparar com os
                requisitos da vaga.
              </p>
              <JobApplyForm job={job} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
