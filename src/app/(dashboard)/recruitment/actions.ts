"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createJobPosting(formData: FormData) {
  await requireRole(["ADMIN", "HR"]);

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const departmentId = String(formData.get("departmentId") || "") || null;
  const openings = Number(formData.get("openings") || 1);

  if (!title || !description) {
    return { error: "Judul dan deskripsi lowongan wajib diisi." };
  }

  await prisma.jobPosting.create({
    data: { title, description, departmentId, openings },
  });

  revalidatePath("/recruitment");
  return { success: true };
}

export async function addCandidate(jobPostingId: string, formData: FormData) {
  await requireRole(["ADMIN", "HR"]);

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;

  if (!fullName || !email) {
    return { error: "Nama dan email kandidat wajib diisi." };
  }

  await prisma.candidate.create({
    data: { jobPostingId, fullName, email, phone },
  });

  revalidatePath(`/recruitment/${jobPostingId}`);
  return { success: true };
}

export async function moveCandidateStage(candidateId: string, stage: string) {
  await requireRole(["ADMIN", "HR"]);

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { stage: stage as any },
    include: { jobPosting: true },
  });

  // Jika kandidat di-hire, otomatis buat record Employee baru
  if (stage === "HIRED" && !candidate.hiredEmployeeId) {
    const code = `EMP${Date.now().toString().slice(-6)}`;
    const employee = await prisma.employee.create({
      data: {
        employeeCode: code,
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        departmentId: candidate.jobPosting.departmentId,
        positionId: candidate.jobPosting.positionId,
        status: "PROBATION",
        baseSalary: 0,
      },
    });
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { hiredEmployeeId: employee.id },
    });
  }

  revalidatePath(`/recruitment/${candidate.jobPostingId}`);
  return { success: true };
}

export async function scheduleInterview(candidateId: string, formData: FormData) {
  await requireRole(["ADMIN", "HR"]);

  const scheduledAt = String(formData.get("scheduledAt") || "");
  const interviewer = String(formData.get("interviewer") || "").trim();

  if (!scheduledAt || !interviewer) {
    return { error: "Jadwal dan nama pewawancara wajib diisi." };
  }

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      interviews: {
        create: { scheduledAt: new Date(scheduledAt), interviewer },
      },
    },
  });

  revalidatePath(`/recruitment/${candidate.jobPostingId}`);
  return { success: true };
}
