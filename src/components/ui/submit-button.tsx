"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Menyimpan..." : label}
    </button>
  );
}
