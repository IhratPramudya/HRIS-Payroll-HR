"use client";

import { useTransition } from "react";
import { decideLeave } from "./actions";
import { useRouter } from "next/navigation";

export function LeaveActionsCell({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function decide(approve: boolean) {
    startTransition(async () => {
      await decideLeave(id, approve);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={isPending}
        onClick={() => decide(true)}
        className="btn-primary text-xs px-2 py-1"
      >
        Setujui
      </button>
      <button
        disabled={isPending}
        onClick={() => decide(false)}
        className="btn-danger text-xs px-2 py-1"
      >
        Tolak
      </button>
    </div>
  );
}
