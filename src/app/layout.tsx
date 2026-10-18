import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "HRIS - Sistem Informasi SDM",
  description: "Sistem HRIS terpadu: Core HR, Attendance, Payroll, Recruitment, Performance & Training",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
