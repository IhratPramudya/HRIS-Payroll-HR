"use server";

import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData): Promise<{ success: true } | { error: string }> {
  const user = await requireUser();
  if (!user.employeeId) return { error: "Akun ini tidak terhubung ke data karyawan." };

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const targetDate = String(formData.get("targetDate") || "");

  if (!title) throw new Error("Judul goal wajib diisi.");

  await prisma.goal.create({
    data: {
      employeeId: user.employeeId,
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  revalidatePath("/performance");
  return { success: true };
}

export async function updateGoalProgress(goalId: string, progress: number): Promise<void> {
  await requireUser();
  const status = progress >= 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";
  await prisma.goal.update({
    where: { id: goalId },
    data: { progress, status },
  });
  revalidatePath("/performance");
}

export async function createReview(formData: FormData): Promise<{ success: true }> {
  const user = await requireRole(["ADMIN", "HR", "MANAGER"]);
  if (!user.employeeId) throw new Error("Akun ini tidak terhubung ke data karyawan.");

  const employeeId = String(formData.get("employeeId") || "");
  const period = String(formData.get("period") || "").trim();
  const rating = Number(formData.get("rating") || 0);
  const strengths = String(formData.get("strengths") || "").trim() || null;
  const improvements = String(formData.get("improvements") || "").trim() || null;

  if (!employeeId || !period) {
    throw new Error("Karyawan dan periode wajib diisi.");
  }

  await prisma.performanceReview.upsert({
    where: { employeeId_period: { employeeId, period } },
    update: { rating, strengths, improvements, status: "SUBMITTED", reviewerId: user.employeeId },
    create: {
      employeeId,
      reviewerId: user.employeeId,
      period,
      rating,
      strengths,
      improvements,
      status: "SUBMITTED",
    },
  });

  revalidatePath("/performance");
  return { success: true };
}
