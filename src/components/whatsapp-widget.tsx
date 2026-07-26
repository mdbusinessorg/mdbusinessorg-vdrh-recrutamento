'use client';

import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';

export function WhatsAppWidget() {
  const t = useTranslations('common');

  return (
    <a
      href={t('whatsappLink')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 animate-float items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/40 transition hover:scale-110"
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-7 w-7 fill-current" />
    </a>
  );
}
