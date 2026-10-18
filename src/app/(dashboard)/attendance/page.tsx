import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ClockWidget } from "./clock-widget";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AttendancePage() {
  const user = await requireUser();
  const isManagerial = ["ADMIN", "HR", "MANAGER"].includes(user.role);

  const todayRecord = user.employeeId
    ? await prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId: user.employeeId, date: startOfToday() } },
      })
    : null;

  const records = isManagerial
    ? await prisma.attendance.findMany({
        orderBy: { date: "desc" },
        take: 50,
        include: { employee: true },
      })
    : await prisma.attendance.findMany({
        where: { employeeId: user.employeeId ?? "" },
        orderBy: { date: "desc" },
        take: 30,
      });

  return (
    <div>
      <PageHeader title="Absensi" description="Catatan kehadiran karyawan" />

      {user.employeeId && (
        <div className="mb-6">
          <ClockWidget
            hasClockIn={!!todayRecord?.clockIn}
            hasClockOut={!!todayRecord?.clockOut}
          />
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {isManagerial && <th>Karyawan</th>}
              <th>Tanggal</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r: any) => (
              <tr key={r.id}>
                {isManagerial && <td>{r.employee.fullName}</td>}
                <td>{formatDate(r.date)}</td>
                <td>{r.clockIn ? formatDateTime(r.clockIn) : "-"}</td>
                <td>{r.clockOut ? formatDateTime(r.clockOut) : "-"}</td>
                <td>
                  <Badge
                    color={
                      r.status === "PRESENT"
                        ? "green"
                        : r.status === "LATE"
                        ? "yellow"
                        : r.status === "ABSENT"
                        ? "red"
                        : "gray"
                    }
                  >
                    {r.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={isManagerial ? 5 : 4} className="text-center text-gray-400 py-6">
                  Belum ada data absensi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
