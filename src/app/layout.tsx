import type { Metadata } from "next";
import { AuthProvider } from "@/lib/supabase/auth-context";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "LOCALHOLIC | 로컬을 사랑하는 사람들",
    template: "%s | LOCALHOLIC",
  },
  description:
    "로컬홀릭 - 지역의 이야기, 특산품, 여행 프로그램을 큐레이션하는 로컬 라이프스타일 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
