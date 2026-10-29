"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DepartmentSchema = z.object({
  name: z.string().trim().min(2, "Nama departemen minimal 2 karakter"),
});

export async function createDepartment(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "HR"]);

  const parsed = DepartmentSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await prisma.department.create({ data: { name: parsed.data.name } });
  revalidatePath("/departments");
}

export async function createPosition(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "HR"]);

  const title = String(formData.get("title") || "").trim();
  const departmentId = String(formData.get("departmentId") || "");

  if (title.length < 2 || !departmentId) {
    throw new Error("Jabatan dan departemen wajib diisi");
  }

  await prisma.position.create({ data: { title, departmentId } });
  revalidatePath("/departments");
}

export async function deleteDepartment(id: string): Promise<void> {
  await requireRole(["ADMIN", "HR"]);
  await prisma.department.delete({ where: { id } });
  revalidatePath("/departments");
}