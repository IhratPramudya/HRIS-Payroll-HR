import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { StatusForm } from "./status-form";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  await requireRole(["ADMIN", "HR", "MANAGER"]);

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      department: true,
      position: true,
      manager: true,
      directReports: true,
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
      goals: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!employee) notFound();

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={employee.fullName}
        description={`${employee.employeeCode} · ${employee.position?.title ?? "Belum ada jabatan"}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-5 md:col-span-2 space-y-3">
          <h3 className="font-semibold mb-2">Informasi Pokok</h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">Email</dt>
            <dd>{employee.email}</dd>
            <dt className="text-gray-500">Telepon</dt>
            <dd>{employee.phone ?? "-"}</dd>
            <dt className="text-gray-500">Departemen</dt>
            <dd>{employee.department?.name ?? "-"}</dd>
            <dt className="text-gray-500">Jabatan</dt>
            <dd>{employee.position?.title ?? "-"}</dd>
            <dt className="text-gray-500">Atasan</dt>
            <dd>{employee.manager?.fullName ?? "-"}</dd>
            <dt className="text-gray-500">Tanggal Bergabung</dt>
            <dd>{formatDate(employee.hireDate)}</dd>
            <dt className="text-gray-500">Gaji Pokok</dt>
            <dd>{formatCurrency(employee.baseSalary.toString())}</dd>
          </dl>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Status Kepegawaian</h3>
          <Badge
            color={
              employee.status === "ACTIVE"
                ? "green"
                : employee.status === "TERMINATED"
                ? "red"
                : "yellow"
            }
          >
            {employee.status}
          </Badge>
          <div className="mt-4">
            <StatusForm employeeId={employee.id} currentStatus={employee.status} />
          </div>
        </div>
      </div>

      {employee.directReports.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold mb-3">Anak Buah ({employee.directReports.length})</h3>
          <ul className="text-sm space-y-1">
            {employee.directReports.map((r) => (
              <li key={r.id}>{r.fullName}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Riwayat Cuti Terakhir</h3>
          {employee.leaveRequests.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada pengajuan cuti.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {employee.leaveRequests.map((lr) => (
                <li key={lr.id} className="py-2 flex justify-between">
                  <span>
                    {formatDate(lr.startDate)} - {formatDate(lr.endDate)}
                  </span>
                  <Badge color={lr.status === "APPROVED" ? "green" : "yellow"}>{lr.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Goal / KPI Terakhir</h3>
          {employee.goals.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada goal.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {employee.goals.map((g) => (
                <li key={g.id} className="py-2">
                  <p className="font-medium">{g.title}</p>
                  <p className="text-xs text-gray-500">Progress: {g.progress}%</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
