"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  navItems: { label: string; href: string }[];
  user: { name: string; email: string } | null;
  onSignOut?: () => void;
}

export default function MobileNav({
  open,
  onClose,
  navItems,
  user,
  onSignOut,
}: MobileNavProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-card shadow-2xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <span className="text-lg font-bold text-primary">LOCALHOLIC</span>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-primary-light"
            aria-label="메뉴 닫기"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="rounded-lg px-4 py-3 text-[15px] font-medium transition-colors hover:bg-primary-light hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mx-4 border-t border-border" />

        {/* Auth Section */}
        <div className="flex flex-col gap-2 p-4">
          {user ? (
            <>
              <div className="mb-2 rounded-lg bg-primary-light px-4 py-3">
                <p className="text-sm font-semibold text-primary">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
              <Link
                href="/mypage"
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary-light"
              >
                마이페이지
              </Link>
              <Link
                href="/mypage/orders"
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary-light"
              >
                주문내역
              </Link>
              <button
                onClick={() => {
                  onClose();
                  onSignOut?.();
                }}
                className="mt-2 rounded-lg px-4 py-2.5 text-left text-sm text-muted transition-colors hover:bg-red-50 hover:text-red-600"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-primary-light"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                onClick={onClose}
                className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
