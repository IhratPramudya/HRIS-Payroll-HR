import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { createDepartment, createPosition } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function DepartmentsPage() {
  await requireRole(["ADMIN", "HR"]);

  const departments = await prisma.department.findMany({
    include: { positions: true, _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Departemen & Jabatan" description="Kelola struktur organisasi perusahaan" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {departments.map((dept) => (
            <div key={dept.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{dept.name}</h3>
                <span className="text-xs text-gray-500">
                  {dept._count.employees} karyawan
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dept.positions.length === 0 ? (
                  <p className="text-xs text-gray-400">Belum ada jabatan</p>
                ) : (
                  dept.positions.map((p) => (
                    <span
                      key={p.id}
                      className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1"
                    >
                      {p.title}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <p className="text-sm text-gray-500">Belum ada departemen. Tambahkan di samping.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Tambah Departemen</h3>
            <form action={createDepartment} className="space-y-3">
              <input name="name" required className="input" placeholder="Contoh: Engineering" />
              <SubmitButton label="Tambah" />
            </form>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-3">Tambah Jabatan</h3>
            <form action={createPosition} className="space-y-3">
              <select name="departmentId" required className="input">
                <option value="">Pilih departemen</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <input name="title" required className="input" placeholder="Contoh: Software Engineer" />
              <SubmitButton label="Tambah" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
