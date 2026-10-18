"use client";

import { updateEmployeeStatus } from "../actions";
import { useTransition } from "react";

const STATUS_OPTIONS = ["ACTIVE", "PROBATION", "ON_LEAVE", "RESIGNED", "TERMINATED"];

export function StatusForm({
  employeeId,
  currentStatus,
}: {
  employeeId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      className="input"
      onChange={(e) => {
        const value = e.target.value;
        startTransition(() => {
          updateEmployeeStatus(employeeId, value);
        });
      }}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
