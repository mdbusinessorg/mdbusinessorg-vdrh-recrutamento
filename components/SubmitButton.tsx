"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium hover:bg-brand-500 disabled:opacity-60"
    >
      {pending ? "A guardar..." : label}
    </button>
  );
}
