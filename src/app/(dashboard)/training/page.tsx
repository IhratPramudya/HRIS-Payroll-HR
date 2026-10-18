import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { createTrainingProgram } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { EnrollButton } from "./enroll-button";

export default async function TrainingPage() {
  const user = await requireUser();
  const isManagerial = ["ADMIN", "HR"].includes(user.role);

  const programs = await prisma.trainingProgram.findMany({
    orderBy: { startDate: "asc" },
    include: { enrollments: true },
  });

  return (
    <div>
      <PageHeader title="Pelatihan & Pengembangan" description="Program training yang tersedia untuk karyawan" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {programs.map((p) => {
            const enrolled = p.enrollments.length;
            const alreadyEnrolled = user.employeeId
              ? p.enrollments.some((e) => e.employeeId === user.employeeId)
              : false;
            return (
              <div key={p.id} className="card p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(p.startDate)} - {formatDate(p.endDate)} · {enrolled}/{p.capacity} peserta
                  </p>
                </div>
                {user.employeeId && (
                  <EnrollButton programId={p.id} alreadyEnrolled={alreadyEnrolled} />
                )}
              </div>
            );
          })}
          {programs.length === 0 && (
            <p className="text-sm text-gray-500">Belum ada program pelatihan.</p>
          )}
        </div>

        {isManagerial && (
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Buat Program Pelatihan</h3>
            <form action={createTrainingProgram} className="space-y-3">
              <input name="title" required className="input" placeholder="Judul pelatihan" />
              <textarea name="description" rows={2} className="input" placeholder="Deskripsi" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Mulai</label>
                  <input type="date" name="startDate" required className="input" />
                </div>
                <div>
                  <label className="label">Selesai</label>
                  <input type="date" name="endDate" required className="input" />
                </div>
              </div>
              <input type="number" name="capacity" min={1} defaultValue={20} className="input" placeholder="Kuota" />
              <SubmitButton label="Buat Program" />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
