import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { runPayroll } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import Link from "next/link";

export default async function PayrollPage() {
  await requireRole(["ADMIN", "HR"]);

  const runs = await prisma.payrollRun.findMany({
    orderBy: { period: "desc" },
    include: { _count: { select: { payslips: true } }, payslips: true },
  });

  return (
    <div>
      <PageHeader title="Payroll" description="Jalankan dan kelola proses penggajian bulanan" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Jumlah Karyawan</th>
                <th>Total Net Pay</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const total = run.payslips.reduce((sum, p) => sum + Number(p.netPay), 0);
                return (
                  <tr key={run.id}>
                    <td className="font-medium">{run.period}</td>
                    <td>{run._count.payslips}</td>
                    <td>{formatCurrency(total)}</td>
                    <td>
                      <Badge color={run.status === "PAID" ? "green" : "yellow"}>{run.status}</Badge>
                    </td>
                    <td>
                      <Link href={`/payroll/${run.id}`} className="text-brand-600 text-sm font-medium">
                        Detail →
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-6">
                    Belum ada proses payroll.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Jalankan Payroll Baru</h3>
          <form action={runPayroll} className="space-y-3">
            <div>
              <label className="label">Periode (YYYY-MM)</label>
              <input name="period" required placeholder="2026-10" className="input" />
            </div>
            <SubmitButton label="Jalankan Payroll" />
          </form>
          <p className="text-xs text-gray-400 mt-3">
            Menghitung gaji seluruh karyawan aktif: gaji pokok, BPJS, dan estimasi PPh21.
          </p>
        </div>
      </div>
    </div>
  );
}
