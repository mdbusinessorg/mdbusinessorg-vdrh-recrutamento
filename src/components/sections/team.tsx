'use client';

import { Linkedin } from 'lucide-react';
import { team } from '@/data/site';

export function Team() {
  return (
    <section id="equipa" className="section-padding bg-slate-50 dark:bg-slate-900/30">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-vdrh-600 dark:text-vdrh-400">
            Nossa Equipa
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Quem move o capital humano
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
            Profissionais dedicados a conectar pessoas e organizações com propósito e excelência.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {team.map((member) => (
            <div
              key={member.name}
              className="card-hover rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="relative mx-auto mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/400x400/e2e8f0/475569?text=Avatar';
                  }}
                />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {member.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm text-vdrh-600 hover:underline dark:text-vdrh-400"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
