import { Quote } from 'lucide-react';
import { testimonials } from '@/data/site';

export function Testimonials() {
  return (
    <section className="section-padding bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
            Depoimentos
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            O que dizem de nós
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="card-hover relative rounded-3xl border border-slate-100 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <Quote className="mb-4 h-8 w-8 text-vdrh-300 dark:text-vdrh-700" />
              <p className="mb-6 leading-relaxed text-slate-700 dark:text-slate-200">
                “{item.text}”
              </p>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{item.author}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
