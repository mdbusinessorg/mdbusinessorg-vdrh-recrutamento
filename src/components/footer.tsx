import Link from 'next/link';
import { Facebook, Linkedin, Instagram, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '@/data/site';

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" id="contacto">
      <div className="section-padding mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{siteConfig.name}</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {siteConfig.fullName}. {siteConfig.slogan}
            </p>
            <div className="flex gap-3">
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:text-vdrh-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-vdrh-400"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:text-vdrh-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-vdrh-400"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:text-vdrh-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-vdrh-400"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Plataforma</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link href="/vagas/" className="inline-flex items-center gap-1 hover:text-vdrh-600">
                  Vagas de Emprego <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/#servicos" className="inline-flex items-center gap-1 hover:text-vdrh-600">
                  Serviços <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/#sobre" className="inline-flex items-center gap-1 hover:text-vdrh-600">
                  Sobre Nós <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/#equipa" className="inline-flex items-center gap-1 hover:text-vdrh-600">
                  Equipa <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Recursos</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link href="/vagas/" className="hover:text-vdrh-600">Pesquisa por vagas</Link>
              </li>
              <li>
                <a href="#" className="hover:text-vdrh-600">Para empresas</a>
              </li>
              <li>
                <a href="#" className="hover:text-vdrh-600">Dicas de carreira</a>
              </li>
              <li>
                <a href="#" className="hover:text-vdrh-600">Política de privacidade</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Contacto</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-vdrh-500" />
                {siteConfig.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-vdrh-500" />
                {siteConfig.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-vdrh-500" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-vdrh-600">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
            <a
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6 w-full text-sm"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.</p>
          <p>
            Desenvolvido para elevar o capital humano de Angola.
          </p>
        </div>
      </div>
    </footer>
  );
}
