"use client";

import { useAuth } from "@/lib/supabase/auth-context";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileOpen: () => void;
}

export default function AdminHeader({
  collapsed,
  onToggleCollapse,
  onMobileOpen,
}: AdminHeaderProps) {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile menu */}
        <button
          onClick={onMobileOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
          aria-label="메뉴"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 lg:flex"
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <path d="M14 9l-3 3 3 3" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {profile && (
          <div className="hidden items-center gap-2 text-sm sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              {profile.name?.[0] || "A"}
            </div>
            <span className="font-medium text-gray-700">
              {profile.name || "관리자"}
            </span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
