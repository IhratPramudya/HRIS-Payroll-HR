import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { LeaveForm } from "./leave-form";
import { LeaveActionsCell } from "./leave-actions-cell";

export default async function LeavePage() {
  const user = await requireUser();
  const isManagerial = ["ADMIN", "HR", "MANAGER"].includes(user.role);

  const requests = isManagerial
    ? await prisma.leaveRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { employee: true },
        take: 100,
      })
    : await prisma.leaveRequest.findMany({
        where: { employeeId: user.employeeId ?? "" },
        orderBy: { createdAt: "desc" },
      });

  return (
    <div>
      <PageHeader title="Cuti & Izin" description="Pengajuan dan persetujuan cuti karyawan" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  {isManagerial && <th>Karyawan</th>}
                  <th>Jenis</th>
                  <th>Periode</th>
                  <th>Hari</th>
                  <th>Status</th>
                  {isManagerial && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((r: any) => (
                  <tr key={r.id}>
                    {isManagerial && <td>{r.employee.fullName}</td>}
                    <td>{r.type}</td>
                    <td>
                      {formatDate(r.startDate)} - {formatDate(r.endDate)}
                    </td>
                    <td>{r.days}</td>
                    <td>
                      <Badge
                        color={
                          r.status === "APPROVED"
                            ? "green"
                            : r.status === "REJECTED"
                            ? "red"
                            : r.status === "CANCELLED"
                            ? "gray"
                            : "yellow"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    {isManagerial && (
                      <td>{r.status === "PENDING" && <LeaveActionsCell id={r.id} />}</td>
                    )}
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={isManagerial ? 6 : 4} className="text-center text-gray-400 py-6">
                      Belum ada pengajuan cuti.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {user.employeeId && (
          <div>
            <LeaveForm />
          </div>
        )}
      </div>
    </div>
  );
}
