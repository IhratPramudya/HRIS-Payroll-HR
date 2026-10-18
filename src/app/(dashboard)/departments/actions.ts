"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DepartmentSchema = z.object({
  name: z.string().min(2, "Nama departemen minimal 2 karakter"),
});

export async function createDepartment(formData: FormData) {
  await requireRole(["ADMIN", "HR"]);

  const parsed = DepartmentSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await prisma.department.create({ data: { name: parsed.data.name } });
  revalidatePath("/departments");
  return { success: true };
}

export async function createPosition(formData: FormData) {
  await requireRole(["ADMIN", "HR"]);

  const title = String(formData.get("title") || "").trim();
  const departmentId = String(formData.get("departmentId") || "");

  if (title.length < 2 || !departmentId) {
    return { error: "Jabatan dan departemen wajib diisi" };
  }

  await prisma.position.create({ data: { title, departmentId } });
  revalidatePath("/departments");
  return { success: true };
}

export async function deleteDepartment(id: string) {
  await requireRole(["ADMIN", "HR"]);
  await prisma.department.delete({ where: { id } });
  revalidatePath("/departments");
}
