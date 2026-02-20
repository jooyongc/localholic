"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onMobileOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
