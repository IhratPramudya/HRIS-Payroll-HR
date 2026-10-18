import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";

/**
 * Mengambil session saat ini di Server Component / Server Action.
 * Jika belum login, redirect ke halaman login.
 */
export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return session!.user;
}

/**
 * Memastikan user memiliki salah satu role yang diizinkan.
 * Jika tidak, redirect ke dashboard dengan pesan tidak diizinkan.
 */
export async function requireRole(allowed: Role[]) {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    redirect("/dashboard?error=forbidden");
  }
  return user;
}

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  HR: "HR",
  MANAGER: "Manager",
  EMPLOYEE: "Karyawan",
};
