'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContactFormProps {
  table: string;
  extraFields?: { name: string; label: string; type?: string; options?: string[] }[];
  successMessage?: string;
}

export function ContactForm({ table, extraFields = [], successMessage }: ContactFormProps) {
  const t = useTranslations();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const baseSchema = {
    name: z.string().min(2, 'Nome obrigatório'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().min(8, 'Telefone obrigatório'),
    message: z.string().min(5, 'Mensagem obrigatória'),
  };

  const extraSchema: Record<string, z.ZodTypeAny> = {};
  extraFields.forEach((field) => {
    if (field.type === 'file') {
      extraSchema[field.name] = z.instanceof(FileList).optional();
    } else if (field.options) {
      extraSchema[field.name] = z.string().min(1, `${field.label} obrigatório`);
    } else {
      extraSchema[field.name] = z.string().min(1, `${field.label} obrigatório`);
    }
  });

  const schema = z.object({ ...baseSchema, ...extraSchema });
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setStatus('idle');
    if (!supabase) {
      setStatus('error');
      return;
    }
    try {
      const payload: Record<string, any> = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        locale: document.documentElement.lang || 'pt',
      };

      extraFields.forEach((field) => {
        if (field.type !== 'file') {
          payload[field.name] = (data as any)[field.name];
        }
      });

      const { error } = await supabase.from(table).insert([payload]);
      if (error) throw error;

      setStatus('success');
      reset();
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('contact.form.name')}
        </label>
        <input
          {...register('name')}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.email')}
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.phone')}
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      {extraFields.map((field) => (
        <div key={field.name}>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {field.label}
          </label>
          {field.options ? (
            <select
              {...register(field.name as any)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">{field.label}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              {...register(field.name as any)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          )}
        </div>
      ))}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('contact.form.message')}
        </label>
        <textarea
          rows={4}
          {...register('message')}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-vdrh-500 focus:ring-2 focus:ring-vdrh-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.sending')}
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" /> {t('contact.form.submit')}
          </>
        )}
      </button>

      {status === 'success' && (
        <div className="rounded-2xl bg-green-50 p-4 text-center text-green-700 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle className="mx-auto mb-2 h-6 w-6" />
          {successMessage || t('contact.form.success')}
        </div>
      )}

      {status === 'error' && (
        <p className="text-center text-sm text-red-500">{t('contact.form.error')}</p>
      )}
    </form>
  );
}
