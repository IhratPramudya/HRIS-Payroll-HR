"use client";

import { useTransition } from "react";
import { enrollTraining } from "./actions";
import { useRouter } from "next/navigation";

export function EnrollButton({ programId, alreadyEnrolled }: { programId: string; alreadyEnrolled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleEnroll() {
    startTransition(async () => {
      await enrollTraining(programId);
      router.refresh();
    });
  }

  return (
    <button
      disabled={isPending || alreadyEnrolled}
      onClick={handleEnroll}
      className="btn-primary text-xs px-3 py-1.5"
    >
      {alreadyEnrolled ? "Terdaftar" : "Daftar"}
    </button>
  );
}
