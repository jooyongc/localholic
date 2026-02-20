import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  href: string;
}

export default function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between lg:mb-8">
      <h2 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
        {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-primary"
      >
        전체보기
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </div>
  );
}
