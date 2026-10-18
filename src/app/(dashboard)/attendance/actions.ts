"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function clockIn() {
  const user = await requireUser();
  if (!user.employeeId) return { error: "Akun ini tidak terhubung ke data karyawan." };

  const today = startOfToday();
  const now = new Date();
  const hour = now.getHours();
  const status = hour >= 9 ? "LATE" : "PRESENT";

  await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: user.employeeId, date: today } },
    update: { clockIn: now, status },
    create: {
      employeeId: user.employeeId,
      date: today,
      clockIn: now,
      status,
    },
  });

  revalidatePath("/attendance");
  return { success: true };
}

export async function clockOut() {
  const user = await requireUser();
  if (!user.employeeId) return { error: "Akun ini tidak terhubung ke data karyawan." };

  const today = startOfToday();

  await prisma.attendance.update({
    where: { employeeId_date: { employeeId: user.employeeId, date: today } },
    data: { clockOut: new Date() },
  });

  revalidatePath("/attendance");
  return { success: true };
}
