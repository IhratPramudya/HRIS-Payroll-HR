"use client";

import { requestLeave } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { useRef, useState } from "react";

const TYPES = ["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"];

export function LeaveForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const res = await requestLeave(formData);
    if (res?.error) {
      setError(res.error);
    } else {
      setError(null);
      formRef.current?.reset();
    }
  }

  return (
    <form ref={formRef} action={handleAction} className="card p-5 space-y-3">
      <h3 className="font-semibold">Ajukan Cuti / Izin</h3>

      <div>
        <label className="label">Jenis</label>
        <select name="type" required className="input">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tanggal Mulai</label>
          <input type="date" name="startDate" required className="input" />
        </div>
        <div>
          <label className="label">Tanggal Selesai</label>
          <input type="date" name="endDate" required className="input" />
        </div>
      </div>

      <div>
        <label className="label">Alasan</label>
        <textarea name="reason" rows={2} className="input" />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <SubmitButton label="Ajukan" />
    </form>
  );
}
