import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
      <Link href="/" className="mb-8 flex flex-col items-center leading-none">
        <span className="text-2xl font-bold tracking-tight text-primary">
          LOCALHOLIC
        </span>
        <span className="mt-0.5 text-xs tracking-wide text-muted">
          로컬을 사랑하는 사람들
        </span>
      </Link>
      {children}
    </div>
  );
}
