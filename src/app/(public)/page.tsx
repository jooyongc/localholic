import Link from "next/link";

const SECTIONS = [
  {
    title: "스토리",
    description: "지역의 숨겨진 이야기를 만나보세요",
    href: "/stories",
    emoji: "📖",
  },
  {
    title: "지역상품",
    description: "로컬 장인이 만든 특별한 상품",
    href: "/products",
    emoji: "🎁",
  },
  {
    title: "여행프로그램",
    description: "현지인과 함께하는 진짜 로컬 여행",
    href: "/travel",
    emoji: "🗺️",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-5 py-24 text-center lg:py-36">
        <p className="mb-4 text-sm font-medium tracking-widest text-accent">
          LOCAL CURATION CHANNEL
        </p>
        <h1 className="max-w-2xl text-3xl font-bold leading-snug tracking-tight text-foreground md:text-5xl md:leading-tight">
          로컬의 가치를 발견하고,
          <br />
          <span className="text-primary">진짜 이야기</span>를 전합니다
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted md:text-lg">
          전국 각지의 이야기, 특산품, 여행 프로그램을 큐레이션하여
          로컬을 사랑하는 사람들에게 전달합니다.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/stories"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            스토리 보기
          </Link>
          <Link
            href="/travel"
            className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary-light"
          >
            여행 프로그램
          </Link>
        </div>
      </section>

      {/* Section Cards */}
      <section className="mx-auto max-w-6xl px-5 pb-24 lg:pb-36">
        <div className="grid gap-5 md:grid-cols-3">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <span className="text-3xl">{section.emoji}</span>
              <h2 className="mt-4 text-lg font-bold text-foreground group-hover:text-primary">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {section.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                자세히 보기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
