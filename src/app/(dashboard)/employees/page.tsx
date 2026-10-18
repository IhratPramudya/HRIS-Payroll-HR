import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLOR: Record<string, "green" | "yellow" | "red" | "gray"> = {
  ACTIVE: "green",
  PROBATION: "yellow",
  RESIGNED: "gray",
  TERMINATED: "red",
  ON_LEAVE: "yellow",
};

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireRole(["ADMIN", "HR", "MANAGER"]);
  const q = searchParams.q?.trim();

  const employees = await prisma.employee.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { employeeCode: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { department: true, position: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Karyawan"
        description={`${employees.length} karyawan ditemukan`}
        action={
          <Link href="/employees/new" className="btn-primary">
            + Tambah Karyawan
          </Link>
        }
      />

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama, email, atau kode karyawan..."
          className="input max-w-sm"
        />
      </form>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th>Departemen</th>
              <th>Jabatan</th>
              <th>Gaji Pokok</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="font-mono text-xs">{emp.employeeCode}</td>
                <td>
                  <Link href={`/employees/${emp.id}`} className="text-brand-600 font-medium hover:underline">
                    {emp.fullName}
                  </Link>
                  <p className="text-xs text-gray-400">{emp.email}</p>
                </td>
                <td>{emp.department?.name ?? "-"}</td>
                <td>{emp.position?.title ?? "-"}</td>
                <td>{formatCurrency(emp.baseSalary.toString())}</td>
                <td>
                  <Badge color={STATUS_COLOR[emp.status]}>{emp.status}</Badge>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-6">
                  Tidak ada data karyawan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
