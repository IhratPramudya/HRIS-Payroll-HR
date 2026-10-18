import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { createJobPosting } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import Link from "next/link";

export default async function RecruitmentPage() {
  await requireRole(["ADMIN", "HR"]);

  const [jobs, departments] = await Promise.all([
    prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" },
      include: { department: true, _count: { select: { candidates: true } } },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Rekrutmen" description="Kelola lowongan dan pipeline kandidat" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/recruitment/${job.id}`}
              className="card p-5 block hover:border-brand-400"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-xs text-gray-500">
                    {job.department?.name ?? "Umum"} · {job.openings} posisi dibutuhkan
                  </p>
                </div>
                <div className="text-right">
                  <Badge color={job.status === "OPEN" ? "green" : "gray"}>{job.status}</Badge>
                  <p className="text-xs text-gray-500 mt-1">{job._count.candidates} kandidat</p>
                </div>
              </div>
            </Link>
          ))}
          {jobs.length === 0 && (
            <p className="text-sm text-gray-500">Belum ada lowongan dibuka.</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Buka Lowongan Baru</h3>
          <form action={createJobPosting} className="space-y-3">
            <input name="title" required className="input" placeholder="Judul posisi" />
            <select name="departmentId" className="input">
              <option value="">- Departemen -</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="openings"
              min={1}
              defaultValue={1}
              className="input"
              placeholder="Jumlah posisi"
            />
            <textarea
              name="description"
              required
              rows={3}
              className="input"
              placeholder="Deskripsi pekerjaan"
            />
            <SubmitButton label="Buka Lowongan" />
          </form>
        </div>
      </div>
    </div>
  );
}
