import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    totalEmployees,
    activeEmployees,
    pendingLeaves,
    openJobs,
    todayAttendance,
    upcomingTrainings,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.jobPosting.count({ where: { status: "OPEN" } }),
    prisma.attendance.count({
      where: { date: { equals: new Date(new Date().toDateString()) } },
    }),
    prisma.trainingProgram.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
  ]);

  const recentLeaves = await prisma.leaveRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { employee: true },
  });

  return (
    <div>
      <PageHeader
        title={`Selamat datang, ${user.name ?? ""}`}
        description="Ringkasan kondisi SDM perusahaan saat ini"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Karyawan" value={totalEmployees} hint={`${activeEmployees} aktif`} />
        <StatCard label="Cuti Menunggu Persetujuan" value={pendingLeaves} />
        <StatCard label="Lowongan Terbuka" value={openJobs} />
        <StatCard label="Absensi Hari Ini" value={todayAttendance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Pengajuan Cuti Terbaru</h2>
          {recentLeaves.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada pengajuan cuti.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentLeaves.map((lr) => (
                <li key={lr.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{lr.employee.fullName}</p>
                    <p className="text-gray-500 text-xs">
                      {formatDate(lr.startDate)} - {formatDate(lr.endDate)} ({lr.days} hari)
                    </p>
                  </div>
                  <Badge
                    color={
                      lr.status === "APPROVED"
                        ? "green"
                        : lr.status === "REJECTED"
                        ? "red"
                        : lr.status === "CANCELLED"
                        ? "gray"
                        : "yellow"
                    }
                  >
                    {lr.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Link href="/leave" className="text-brand-600 text-sm font-medium mt-4 inline-block">
            Lihat semua →
          </Link>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Pelatihan Mendatang</h2>
          {upcomingTrainings.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada jadwal pelatihan.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcomingTrainings.map((t) => (
                <li key={t.id} className="py-2 text-sm">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-gray-500 text-xs">
                    {formatDate(t.startDate)} - {formatDate(t.endDate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/training" className="text-brand-600 text-sm font-medium mt-4 inline-block">
            Lihat semua →
          </Link>
        </div>
      </div>
    </div>
  );
}
