"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

const NAV_ITEMS: { href: string; label: string; icon: string; roles?: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/employees", label: "Karyawan", icon: "👥", roles: ["ADMIN", "HR", "MANAGER"] },
  { href: "/departments", label: "Departemen", icon: "🏢", roles: ["ADMIN", "HR"] },
  { href: "/attendance", label: "Absensi", icon: "🕒" },
  { href: "/leave", label: "Cuti & Izin", icon: "🗓️" },
  { href: "/payroll", label: "Payroll", icon: "💰", roles: ["ADMIN", "HR"] },
  { href: "/recruitment", label: "Rekrutmen", icon: "📋", roles: ["ADMIN", "HR"] },
  { href: "/performance", label: "Kinerja", icon: "🎯" },
  { href: "/training", label: "Pelatihan", icon: "🎓" },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-brand-900 text-white min-h-screen px-4 py-6">
      <div className="px-2 mb-8">
        <h1 className="text-xl font-bold">HRIS</h1>
        <p className="text-xs text-brand-200">Sistem Informasi SDM</p>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role)).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-600 text-white"
                  : "text-brand-100 hover:bg-brand-800"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="text-xs text-brand-300 px-2 pt-4 border-t border-brand-800">
        © {new Date().getFullYear()} HRIS
      </div>
    </aside>
  );
}
