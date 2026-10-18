"use client";

import { useTransition } from "react";
import { updateGoalProgress } from "./actions";
import { useRouter } from "next/navigation";

export function GoalItem({ goal }: { goal: any }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    startTransition(async () => {
      await updateGoalProgress(goal.id, value);
      router.refresh();
    });
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <p className="font-medium text-sm">{goal.title}</p>
        <span className="text-xs text-gray-500">{goal.progress}%</span>
      </div>
      {goal.description && <p className="text-xs text-gray-500 mb-2">{goal.description}</p>}
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        defaultValue={goal.progress}
        disabled={isPending}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  );
}
