import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { createGoal, createReview } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { GoalItem } from "./goal-item";
import { Badge } from "@/components/ui/badge";

export default async function PerformancePage() {
  const user = await requireUser();
  const isManagerial = ["ADMIN", "HR", "MANAGER"].includes(user.role);

  const goals = await prisma.goal.findMany({
    where: isManagerial ? undefined : { employeeId: user.employeeId ?? "" },
    include: isManagerial ? { employee: true } : undefined,
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const reviews = await prisma.performanceReview.findMany({
    where: isManagerial ? undefined : { employeeId: user.employeeId ?? "" },
    include: { employee: true, reviewer: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const employees = isManagerial
    ? await prisma.employee.findMany({ orderBy: { fullName: "asc" } })
    : [];

  return (
    <div>
      <PageHeader title="Kinerja (Performance)" description="Goal/KPI dan penilaian kinerja karyawan" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold mb-2">Goal / KPI {isManagerial ? "Seluruh Karyawan" : "Saya"}</h3>
          {goals.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada goal.</p>
          ) : (
            <div>
              {goals.map((g: any) => (
                <div key={g.id}>
                  {isManagerial && <p className="text-xs text-gray-400 mt-2">{g.employee.fullName}</p>}
                  <GoalItem goal={g} />
                </div>
              ))}
            </div>
          )}
        </div>

        {!isManagerial && (
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Tambah Goal Baru</h3>
            <form action={createGoal} className="space-y-3">
              <input name="title" required className="input" placeholder="Judul goal" />
              <textarea name="description" rows={2} className="input" placeholder="Deskripsi" />
              <input type="date" name="targetDate" className="input" />
              <SubmitButton label="Tambah Goal" />
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-x-auto">
          <h3 className="font-semibold p-5 pb-0">Riwayat Penilaian Kinerja</h3>
          <table className="table-base mt-3">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Periode</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>{r.employee.fullName}</td>
                  <td>{r.period}</td>
                  <td>{r.rating ? "⭐".repeat(r.rating) : "-"}</td>
                  <td>
                    <Badge color={r.status === "SUBMITTED" ? "green" : "gray"}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-6">
                    Belum ada penilaian kinerja.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isManagerial && (
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Buat Penilaian Kinerja</h3>
            <form action={createReview} className="space-y-3">
              <select name="employeeId" required className="input">
                <option value="">- Pilih karyawan -</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName}
                  </option>
                ))}
              </select>
              <input name="period" required placeholder="Contoh: 2026-Q4" className="input" />
              <select name="rating" required className="input">
                <option value="">- Rating -</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} - {"⭐".repeat(n)}
                  </option>
                ))}
              </select>
              <textarea name="strengths" rows={2} className="input" placeholder="Kekuatan" />
              <textarea name="improvements" rows={2} className="input" placeholder="Area pengembangan" />
              <SubmitButton label="Simpan Penilaian" />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
