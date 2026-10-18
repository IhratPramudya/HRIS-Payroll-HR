import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";
import { markPayrollPaid } from "../actions";

export default async function PayrollRunDetailPage({ params }: { params: { id: string } }) {
  await requireRole(["ADMIN", "HR"]);

  const run = await prisma.payrollRun.findUnique({
    where: { id: params.id },
    include: { payslips: { include: { employee: true }, orderBy: { employee: { fullName: "asc" } } } },
  });

  if (!run) notFound();

  const totalNet = run.payslips.reduce((sum, p) => sum + Number(p.netPay), 0);

  return (
    <div>
      <PageHeader
        title={`Payroll ${run.period}`}
        description={`Total ${run.payslips.length} slip gaji · Total net: ${formatCurrency(totalNet)}`}
        action={
          run.status !== "PAID" ? (
            <form action={markPayrollPaid.bind(null, run.id)}>
              <button className="btn-primary">Tandai Sudah Dibayar</button>
            </form>
          ) : (
            <Badge color="green">Sudah Dibayar</Badge>
          )
        }
      />

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>Gaji Pokok</th>
              <th>BPJS Kes.</th>
              <th>BPJS TK</th>
              <th>PPh21</th>
              <th>Gross</th>
              <th>Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {run.payslips.map((p) => (
              <tr key={p.id}>
                <td>{p.employee.fullName}</td>
                <td>{formatCurrency(p.baseSalary.toString())}</td>
                <td>{formatCurrency(p.bpjsKesehatan.toString())}</td>
                <td>{formatCurrency(p.bpjsKetenagakerjaan.toString())}</td>
                <td>{formatCurrency(p.pph21.toString())}</td>
                <td>{formatCurrency(p.grossPay.toString())}</td>
                <td className="font-semibold">{formatCurrency(p.netPay.toString())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
