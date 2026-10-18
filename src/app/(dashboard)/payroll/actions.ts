"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { calculatePayroll } from "@/lib/payroll";

export async function runPayroll(formData: FormData) {
  await requireRole(["ADMIN", "HR"]);

  const period = String(formData.get("period") || "");
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return { error: "Format periode harus YYYY-MM, contoh 2026-10" };
  }

  const existing = await prisma.payrollRun.findUnique({ where: { period } });
  if (existing) {
    return { error: `Payroll untuk periode ${period} sudah pernah dijalankan.` };
  }

  const employees = await prisma.employee.findMany({ where: { status: "ACTIVE" } });

  const payrollRun = await prisma.payrollRun.create({
    data: { period, status: "PROCESSED" },
  });

  for (const emp of employees) {
    const result = calculatePayroll({ baseSalary: Number(emp.baseSalary) });
    await prisma.payslip.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: emp.id,
        baseSalary: result.baseSalary,
        allowance: result.allowance,
        overtime: result.overtime,
        bpjsKesehatan: result.bpjsKesehatan,
        bpjsKetenagakerjaan: result.bpjsKetenagakerjaan,
        pph21: result.pph21,
        deductionOther: result.deductionOther,
        grossPay: result.grossPay,
        netPay: result.netPay,
      },
    });
  }

  revalidatePath("/payroll");
  return { success: true };
}

export async function markPayrollPaid(id: string) {
  await requireRole(["ADMIN", "HR"]);
  await prisma.payrollRun.update({ where: { id }, data: { status: "PAID" } });
  revalidatePath("/payroll");
}
