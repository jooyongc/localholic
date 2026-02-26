import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STORY_CATEGORIES } from "@/lib/constants/story";
import type { Story } from "@/types/database";
import StoryCard from "@/components/story/StoryCard";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = {
  title: "로컬 스토리",
  description: "전국 각지의 로컬 이야기를 만나보세요. 맛집, 카페, 문화, 자연, 사람, 축제 등 다양한 스토리를 큐레이션합니다.",
};

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function StoriesPage({ searchParams }: Props) {
  const { category, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("stories")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category && STORY_CATEGORIES.includes(category as (typeof STORY_CATEGORIES)[number])) {
    query = query.eq("category", category);
  }

  const { data, count } = await query.range(from, to);
  const stories: Story[] = data ?? [];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const activeCategory = category ?? null;

  function buildHref(cat: string | null, pg: number) {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (pg > 1) params.set("page", String(pg));
    const qs = params.toString();
    return `/stories${qs ? `?${qs}` : ""}`;
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          로컬 스토리
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          전국 각지의 특별한 이야기를 만나보세요
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Link
          href={buildHref(null, 1)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-primary text-white"
              : "bg-card text-muted border border-border hover:border-primary/30 hover:text-foreground"
          }`}
        >
          전체
        </Link>
        {STORY_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={buildHref(cat, 1)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-white"
                : "bg-card text-muted border border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Story grid */}
      {stories.length > 0 ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={buildHref(activeCategory, currentPage - 1)}
                  className="flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-muted transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-1">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  이전
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 2
                )
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] ?? 0) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`dot-${i}`} className="px-1 text-muted">
                      ...
                    </span>
                  ) : (
                    <Link
                      key={item}
                      href={buildHref(activeCategory, item)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        item === currentPage
                          ? "bg-primary text-white"
                          : "border border-border bg-card text-muted hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {item}
                    </Link>
                  )
                )}

              {currentPage < totalPages && (
                <Link
                  href={buildHref(activeCategory, currentPage + 1)}
                  className="flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-muted transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  다음
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ml-1">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              )}
            </nav>
          )}
        </>
      ) : (
        <EmptyState
          message={
            activeCategory
              ? `'${activeCategory}' 카테고리의 스토리가 아직 없습니다`
              : "아직 등록된 스토리가 없습니다"
          }
        />
      )}
    </section>
  );
}
