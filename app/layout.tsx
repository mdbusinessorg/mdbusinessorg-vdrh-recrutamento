import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MÔ SALO — Candidatura Automática",
  description: "Painel privado de candidatura automática do Matias.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body className="antialiased">{children}</body>
    </html>
  );
}
