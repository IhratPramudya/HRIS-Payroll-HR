"use server";

import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createTrainingProgram(formData: FormData) {
  await requireRole(["ADMIN", "HR"]);

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const capacity = Number(formData.get("capacity") || 20);

  if (!title || !startDate || !endDate) {
    return { error: "Judul, tanggal mulai, dan tanggal selesai wajib diisi." };
  }

  await prisma.trainingProgram.create({
    data: {
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      capacity,
    },
  });

  revalidatePath("/training");
  return { success: true };
}

export async function enrollTraining(trainingProgramId: string) {
  const user = await requireUser();
  if (!user.employeeId) return { error: "Akun ini tidak terhubung ke data karyawan." };

  const program = await prisma.trainingProgram.findUnique({
    where: { id: trainingProgramId },
    include: { _count: { select: { enrollments: true } } },
  });

  if (!program) return { error: "Program tidak ditemukan." };
  if (program._count.enrollments >= program.capacity) {
    return { error: "Kuota pelatihan sudah penuh." };
  }

  await prisma.trainingEnrollment.upsert({
    where: {
      trainingProgramId_employeeId: { trainingProgramId, employeeId: user.employeeId },
    },
    update: {},
    create: { trainingProgramId, employeeId: user.employeeId },
  });

  revalidatePath("/training");
  return { success: true };
}
