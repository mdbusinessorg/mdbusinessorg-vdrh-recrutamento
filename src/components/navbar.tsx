'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const { resolvedTheme, toggleTheme } = useTheme();
  const t = useTranslations('nav');
  const tc = useTranslations('common');

  const otherLocales = ['pt', 'en', 'fr'].filter((l) => l !== locale);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: t('home'), href: `/${locale}/` },
    { label: t('services'), href: `/${locale}/servico/` },
    { label: t('career'), href: `/${locale}/carreira/` },
    { label: t('contact'), href: `/${locale}/contactos/` },
  ];

  function switchLocale(newLocale: string) {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  }

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
        <Link href={`/${locale}/`} className="flex items-center gap-2">
          <Image
            src="/vdrh-logo.png"
            alt="VDRH"
            width={48}
            height={48}
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            VDRH
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-vdrh-50 text-vdrh-700 dark:bg-vdrh-900/30 dark:text-vdrh-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <div className="relative group">
            <button className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <Globe className="h-4 w-4" /> {locale.toUpperCase()}
            </button>
            <div className="absolute right-0 top-full hidden min-w-[100px] rounded-2xl border border-slate-100 bg-white p-2 shadow-xl group-hover:block dark:border-slate-800 dark:bg-slate-900">
              {otherLocales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-vdrh-50 dark:text-slate-200 dark:hover:bg-vdrh-900/30"
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Alternar tema"
          >
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
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
                  pathname === link.href
                    ? 'bg-vdrh-50 text-vdrh-700 dark:bg-vdrh-900/30 dark:text-vdrh-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {['pt', 'en', 'fr'].map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={cn(
                    'flex-1 rounded-xl py-2 text-sm font-medium',
                    l === locale
                      ? 'bg-vdrh-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  )}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
