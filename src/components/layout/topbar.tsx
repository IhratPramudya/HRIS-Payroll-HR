"use client";

import { signOut } from "next-auth/react";
import { ROLE_LABEL } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export function Topbar({ name, role }: { name: string; role: Role }) {
  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3">
      <div className="md:hidden font-bold text-brand-900">HRIS</div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{name}</p>
          <p className="text-xs text-gray-500">{ROLE_LABEL[role]}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn-secondary text-xs"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
