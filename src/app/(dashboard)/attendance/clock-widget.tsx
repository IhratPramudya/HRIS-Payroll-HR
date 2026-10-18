"use client";

import { useTransition } from "react";
import { clockIn, clockOut } from "./actions";
import { useRouter } from "next/navigation";

export function ClockWidget({
  hasClockIn,
  hasClockOut,
}: {
  hasClockIn: boolean;
  hasClockOut: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClockIn() {
    startTransition(async () => {
      await clockIn();
      router.refresh();
    });
  }

  function handleClockOut() {
    startTransition(async () => {
      await clockOut();
      router.refresh();
    });
  }

  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Absensi Hari Ini</h3>
        <p className="text-sm text-gray-500">
          {hasClockIn
            ? hasClockOut
              ? "Anda sudah clock-in dan clock-out hari ini."
              : "Anda sudah clock-in. Jangan lupa clock-out."
            : "Anda belum melakukan clock-in hari ini."}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleClockIn}
          disabled={isPending || hasClockIn}
          className="btn-primary"
        >
          Clock In
        </button>
        <button
          onClick={handleClockOut}
          disabled={isPending || !hasClockIn || hasClockOut}
          className="btn-secondary"
        >
          Clock Out
        </button>
      </div>
    </div>
  );
}
