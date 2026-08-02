import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VDRH — Visão e Desenvolvimento de Recursos Humanos',
  description:
    'Consultora de Recursos Humanos em Angola. Recrutamento, desenvolvimento de talentos, diversidade, inclusão e conformidade laboral.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
