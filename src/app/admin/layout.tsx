import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "관리자",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
