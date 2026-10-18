import { requireUser } from "@/lib/rbac";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col">
        <Topbar name={user.name ?? user.email ?? "Pengguna"} role={user.role} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
