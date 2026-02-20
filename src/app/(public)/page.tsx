import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Story, Product, TravelProgram } from "@/types/database";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import StoryCard from "@/components/story/StoryCard";
import ProductCard from "@/components/shop/ProductCard";
import TravelCard from "@/components/travel/TravelCard";

async function getLatestStories(): Promise<Story[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

async function getPopularProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);
  return data ?? [];
}

async function getTravelPrograms(): Promise<TravelProgram[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("travel_programs")
    .select("*")
    .eq("status", "active")
    .order("start_date", { ascending: true })
    .limit(6);
  return data ?? [];
}

export default async function Home() {
  const [stories, products, programs] = await Promise.all([
    getLatestStories(),
    getPopularProducts(),
    getTravelPrograms(),
  ]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[480px] items-center justify-center overflow-hidden bg-primary-light lg:min-h-[560px]">
        {/* Placeholder background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="hero-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center px-5 text-center">
          <span className="mb-5 inline-block rounded-full border border-primary/20 bg-white/60 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary backdrop-blur-sm">
            LOCAL CURATION CHANNEL
          </span>
          <h1 className="max-w-2xl text-3xl font-bold leading-snug tracking-tight text-foreground md:text-5xl md:leading-[1.2]">
            당신의 지역을
            <br />
            <span className="text-primary">발견</span>하세요
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
            전국 각지의 이야기, 특산품, 여행 프로그램을
            <br className="hidden sm:block" />
            큐레이션하여 전합니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/stories"
              className="rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30"
            >
              스토리 보기
            </Link>
            <Link
              href="/products"
              className="rounded-xl border border-border bg-white px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary-light"
            >
              상품 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest Stories ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <SectionHeader title="로컬 스토리" href="/stories" />
        {stories.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <EmptyState message="아직 등록된 스토리가 없습니다" />
        )}
      </section>

      {/* ── Popular Products ── */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
          <SectionHeader title="지역 특산품" href="/products" />
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState message="아직 등록된 상품이 없습니다" />
          )}
        </div>
      </section>

      {/* ── Travel Programs ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <SectionHeader title="로컬 여행" href="/travel" />
        {programs.length > 0 ? (
          <div className="-mx-5 flex gap-5 overflow-x-auto px-5 pb-4 scrollbar-hide lg:-mx-0 lg:px-0">
            {programs.map((program) => (
              <TravelCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <EmptyState message="아직 등록된 여행 프로그램이 없습니다" />
        )}
      </section>
    </>
  );
}
