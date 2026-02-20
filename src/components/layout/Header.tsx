"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import MobileNav from "./MobileNav";

const NAV_ITEMS = [
  { label: "스토리", href: "/stories" },
  { label: "지역상품", href: "/products" },
  { label: "여행프로그램", href: "/travel" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // TODO: Replace with real auth state from Supabase
  const user = null as { name: string; email: string } | null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-primary lg:text-xl">
            LOCALHOLIC
          </span>
          <span className="text-[10px] tracking-wide text-muted lg:text-xs">
            로컬을 사랑하는 사람들
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-2 text-[15px] font-medium text-foreground transition-colors hover:bg-primary-light hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                {user.name?.[0] || "U"}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card p-1 shadow-lg">
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                  <Link
                    href="/mypage"
                    className="mt-1 block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-light"
                  >
                    마이페이지
                  </Link>
                  <Link
                    href="/mypage/orders"
                    className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-light"
                  >
                    주문내역
                  </Link>
                  <button className="mt-1 w-full rounded-lg border-t border-border px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-red-50 hover:text-red-600">
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-primary-light md:hidden"
          aria-label="메뉴 열기"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={NAV_ITEMS}
        user={user}
      />
    </header>
  );
}
