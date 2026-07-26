import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VDRH Recrutamento | Visão e Desenvolvimento de Recursos Humanos',
  description:
    'Plataforma de recrutamento premium de Angola. Conectamos talentos às melhores oportunidades com tecnologia, inteligência e propósito.',
  keywords: ['recrutamento', 'Angola', 'vagas', 'RH', 'talentos', 'VDRH'],
  openGraph: {
    title: 'VDRH Recrutamento',
    description:
      'A nova plataforma de recrutamento de Angola. Talentos & Valores para o Crescimento Organizacional.',
    url: 'https://vdrh-recrutamento.vercel.app',
    siteName: 'VDRH Recrutamento',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
