"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

const EmployeeSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),
  managerId: z.string().optional(),
  baseSalary: z.coerce.number().min(0),
  hireDate: z.string().optional(),
  createLogin: z.boolean().optional(),
});

function generateEmployeeCode() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EMP${Date.now().toString().slice(-6)}${rand}`;
}

export async function createEmployee(formData: FormData) {
  await requireRole(["ADMIN", "HR"]);

  const parsed = EmployeeSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    departmentId: formData.get("departmentId") || undefined,
    positionId: formData.get("positionId") || undefined,
    managerId: formData.get("managerId") || undefined,
    baseSalary: formData.get("baseSalary") || 0,
    hireDate: formData.get("hireDate") || undefined,
    createLogin: formData.get("createLogin") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const data = parsed.data;

  let userId: string | undefined;
  if (data.createLogin) {
    const defaultPassword = "password123";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: "EMPLOYEE",
      },
    });
    userId = user.id;
  }

  const employee = await prisma.employee.create({
    data: {
      employeeCode: generateEmployeeCode(),
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      departmentId: data.departmentId || null,
      positionId: data.positionId || null,
      managerId: data.managerId || null,
      baseSalary: data.baseSalary,
      hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
      userId,
    },
  });

  revalidatePath("/employees");
  redirect(`/employees/${employee.id}`);
}

export async function updateEmployeeStatus(id: string, status: string) {
  await requireRole(["ADMIN", "HR"]);
  await prisma.employee.update({
    where: { id },
    data: { status: status as any },
  });
  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
}
