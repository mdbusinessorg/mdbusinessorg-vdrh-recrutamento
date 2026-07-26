'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon, Briefcase, Building2, Users, Phone } from 'lucide-react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/data/site';

const links = [
  { label: 'Início', href: '/' },
  { label: 'Vagas', href: '/vagas/' },
  { label: 'Serviços', href: '/#servicos' },
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Equipa', href: '/#equipa' },
  { label: 'Contacto', href: '/#contacto' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 py-3 shadow-sm backdrop-blur-xl dark:bg-slate-950/90'
          : 'bg-transparent py-5'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vdrh-600 to-vdrh-400 text-white shadow-lg shadow-vdrh-500/30">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition',
                pathname === link.href.replace(/\/$/, '') || pathname === link.href
                  ? 'bg-vdrh-50 text-vdrh-700 dark:bg-vdrh-900/30 dark:text-vdrh-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Alternar tema"
          >
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link href="/vagas/" className="btn-primary text-sm">
            Ver Vagas
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Alternar tema"
          >
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full border-t border-slate-100 bg-white px-4 py-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-4 py-3 text-base font-medium transition',
                  pathname === link.href.replace(/\/$/, '') || pathname === link.href
                    ? 'bg-vdrh-50 text-vdrh-700 dark:bg-vdrh-900/30 dark:text-vdrh-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/vagas/"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 text-center text-base"
            >
              Ver Vagas
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
