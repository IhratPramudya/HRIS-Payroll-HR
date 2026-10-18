"use server";

import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { diffDaysInclusive } from "@/lib/utils";
import { z } from "zod";

const LeaveSchema = z.object({
  type: z.enum(["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().optional(),
});

export async function requestLeave(formData: FormData) {
  const user = await requireUser();
  if (!user.employeeId) return { error: "Akun ini tidak terhubung ke data karyawan." };

  const parsed = LeaveSchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);

  if (end < start) {
    return { error: "Tanggal selesai tidak boleh sebelum tanggal mulai." };
  }

  const days = diffDaysInclusive(start, end);

  await prisma.leaveRequest.create({
    data: {
      employeeId: user.employeeId,
      type: parsed.data.type,
      startDate: start,
      endDate: end,
      days,
      reason: parsed.data.reason,
    },
  });

  revalidatePath("/leave");
  return { success: true };
}

export async function decideLeave(id: string, approve: boolean) {
  const user = await requireRole(["ADMIN", "HR", "MANAGER"]);

  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) return { error: "Pengajuan tidak ditemukan." };

  await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      approverId: user.employeeId ?? undefined,
      decidedAt: new Date(),
    },
  });

  if (approve) {
    const year = new Date(leave.startDate).getFullYear();
    await prisma.leaveBalance.upsert({
      where: {
        employeeId_type_year: { employeeId: leave.employeeId, type: leave.type, year },
      },
      update: { used: { increment: leave.days } },
      create: {
        employeeId: leave.employeeId,
        type: leave.type,
        year,
        entitled: 12,
        used: leave.days,
      },
    });
  }

  revalidatePath("/leave");
  return { success: true };
}
