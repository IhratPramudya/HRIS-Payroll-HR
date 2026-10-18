import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { notFound } from "next/navigation";
import { addCandidate } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { CandidateCard } from "./candidate-card";

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;

const STAGE_LABEL: Record<string, string> = {
  APPLIED: "Melamar",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Penawaran",
  HIRED: "Diterima",
  REJECTED: "Ditolak",
};

export default async function JobDetailPage({ params }: { params: { jobId: string } }) {
  await requireRole(["ADMIN", "HR"]);

  const job = await prisma.jobPosting.findUnique({
    where: { id: params.jobId },
    include: {
      department: true,
      candidates: { include: { interviews: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!job) notFound();

  const addCandidateBound = addCandidate.bind(null, job.id);

  return (
    <div>
      <PageHeader
        title={job.title}
        description={`${job.department?.name ?? "Umum"} · ${job.candidates.length} kandidat`}
      />

      <div className="card p-5 mb-6">
        <h3 className="font-semibold mb-3">Tambah Kandidat</h3>
        <form action={addCandidateBound} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input name="fullName" required className="input" placeholder="Nama lengkap" />
          <input name="email" type="email" required className="input" placeholder="Email" />
          <input name="phone" className="input" placeholder="Telepon (opsional)" />
          <SubmitButton label="Tambah" />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const candidates = job.candidates.filter((c) => c.stage === stage);
          return (
            <div key={stage} className="bg-gray-100 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-3">
                {STAGE_LABEL[stage]} ({candidates.length})
              </h4>
              <div className="space-y-2">
                {candidates.map((c) => (
                  <CandidateCard key={c.id} candidate={c} stages={STAGES as unknown as string[]} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
