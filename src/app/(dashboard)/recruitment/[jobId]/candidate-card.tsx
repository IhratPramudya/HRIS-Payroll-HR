"use client";

import { useState, useTransition } from "react";
import { moveCandidateStage, scheduleInterview } from "../actions";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";

export function CandidateCard({
  candidate,
  stages,
}: {
  candidate: any;
  stages: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const router = useRouter();

  function handleStageChange(stage: string) {
    startTransition(async () => {
      await moveCandidateStage(candidate.id, stage);
      router.refresh();
    });
  }

  async function handleInterviewSubmit(formData: FormData) {
    await scheduleInterview(candidate.id, formData);
    setShowInterviewForm(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-md p-3 shadow-sm text-sm">
      <p className="font-medium">{candidate.fullName}</p>
      <p className="text-xs text-gray-500 mb-2">{candidate.email}</p>

      {candidate.interviews?.length > 0 && (
        <p className="text-xs text-brand-600 mb-2">
          Interview: {formatDateTime(candidate.interviews[0].scheduledAt)}
        </p>
      )}

      <select
        value={candidate.stage}
        disabled={isPending}
        onChange={(e) => handleStageChange(e.target.value)}
        className="input text-xs py-1 mb-2"
      >
        {stages.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {!showInterviewForm ? (
        <button
          onClick={() => setShowInterviewForm(true)}
          className="text-xs text-brand-600 font-medium"
        >
          + Jadwalkan interview
        </button>
      ) : (
        <form action={handleInterviewSubmit} className="space-y-1 mt-1">
          <input type="datetime-local" name="scheduledAt" required className="input text-xs py-1" />
          <input name="interviewer" required placeholder="Pewawancara" className="input text-xs py-1" />
          <button type="submit" className="btn-primary text-xs py-1 w-full">
            Simpan
          </button>
        </form>
      )}
    </div>
  );
}
