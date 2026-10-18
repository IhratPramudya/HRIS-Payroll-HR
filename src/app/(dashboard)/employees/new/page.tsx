import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { createEmployee } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function NewEmployeePage() {
  await requireRole(["ADMIN", "HR"]);

  const [departments, positions, managers] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.position.findMany({ orderBy: { title: "asc" } }),
    prisma.employee.findMany({ orderBy: { fullName: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Tambah Karyawan Baru" />

      <form action={createEmployee} className="card p-6 space-y-4">
        <div>
          <label className="label">Nama Lengkap</label>
          <input name="fullName" required className="input" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" required className="input" />
          </div>
          <div>
            <label className="label">Telepon</label>
            <input name="phone" className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Departemen</label>
            <select name="departmentId" className="input">
              <option value="">- Pilih -</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Jabatan</label>
            <select name="positionId" className="input">
              <option value="">- Pilih -</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Atasan Langsung (Manager)</label>
            <select name="managerId" className="input">
              <option value="">- Tidak ada -</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tanggal Bergabung</label>
            <input type="date" name="hireDate" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Gaji Pokok (per bulan, IDR)</label>
          <input type="number" name="baseSalary" min={0} required className="input" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="createLogin" id="createLogin" className="rounded" />
          <label htmlFor="createLogin" className="text-sm text-gray-700">
            Buat akun login untuk karyawan ini (password default: <code>password123</code>)
          </label>
        </div>

        <SubmitButton label="Simpan Karyawan" />
      </form>
    </div>
  );
}
