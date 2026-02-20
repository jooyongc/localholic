import Link from "next/link";

const FOOTER_NAV = [
  {
    title: "서비스",
    links: [
      { label: "스토리", href: "/stories" },
      { label: "지역상품", href: "/products" },
      { label: "여행프로그램", href: "/travel" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { label: "자주 묻는 질문", href: "/faq" },
      { label: "1:1 문의", href: "/contact" },
      { label: "공지사항", href: "/notice" },
    ],
  },
  {
    title: "정책",
    links: [
      { label: "이용약관", href: "/terms" },
      { label: "개인정보처리방침", href: "/privacy" },
      { label: "환불정책", href: "/refund-policy" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/localholic_official",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@localholic",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Blog",
    href: "https://blog.naver.com/localholic",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z" rx="2" />
        <path d="M8 8v8" />
        <path d="M8 8c0 0 0-0 4 4l4-4" />
        <path d="M16 8v8" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
        {/* Top Section */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-primary">
                LOCALHOLIC
              </span>
              <span className="text-[10px] tracking-wide text-muted">
                로컬을 사랑하는 사람들
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              지역의 가치를 발견하고,
              <br />
              로컬의 이야기를 전합니다.
            </p>
            {/* Social */}
            <div className="mt-5 flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-light hover:text-primary"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {FOOTER_NAV.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-border" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-3 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <div className="leading-relaxed">
            <p>
              로컬홀릭 | 대표: 조용 | 사업자등록번호: 000-00-00000
            </p>
            <p>
              주소: 서울특별시 | 이메일: hello@localholic.co.kr
            </p>
          </div>
          <p>&copy; {new Date().getFullYear()} LOCALHOLIC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
