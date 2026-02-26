import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Story } from "@/types/database";
import StoryCard from "@/components/story/StoryCard";
import StoryContent from "./StoryContent";
import ViewCounter from "./ViewCounter";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getStory(slug: string): Promise<Story | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as Story | null;
}

async function getRelatedStories(
  storyId: string,
  category: string | null
): Promise<Story[]> {
  const supabase = await createClient();
  let query = supabase
    .from("stories")
    .select("*")
    .eq("status", "published")
    .neq("id", storyId)
    .order("published_at", { ascending: false })
    .limit(3);

  if (category) {
    query = query.eq("category", category);
  }

  const { data } = await query;
  return (data ?? []) as Story[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);

  if (!story) {
    return { title: "스토리를 찾을 수 없습니다" };
  }

  const description =
    story.meta_description || story.content?.slice(0, 160) || "";

  return {
    title: story.meta_title || story.title,
    description,
    openGraph: {
      title: story.meta_title || story.title,
      description,
      type: "article",
      publishedTime: story.published_at ?? undefined,
      modifiedTime: story.updated_at,
      ...(story.thumbnail_url ? { images: [story.thumbnail_url] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: story.meta_title || story.title,
      description,
      ...(story.thumbnail_url ? { images: [story.thumbnail_url] } : {}),
    },
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const story = await getStory(slug);

  if (!story) notFound();

  const relatedStories = await getRelatedStories(story.id, story.category);

  const publishedDate = story.published_at
    ? new Date(story.published_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    ...(story.thumbnail_url ? { image: story.thumbnail_url } : {}),
    datePublished: story.published_at,
    dateModified: story.updated_at,
    description:
      story.meta_description || story.content?.slice(0, 160) || "",
    author: {
      "@type": "Organization",
      name: "LOCALHOLIC",
    },
    publisher: {
      "@type": "Organization",
      name: "LOCALHOLIC",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewCounter storyId={story.id} />

      <article className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
        {/* Header */}
        <header className="mb-10">
          {story.category && (
            <span className="mb-3 inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
              {story.category}
            </span>
          )}
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-foreground lg:text-4xl lg:leading-snug">
            {story.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted">
            {publishedDate && <time>{publishedDate}</time>}
            {story.regions && story.regions.length > 0 && (
              <>
                <span className="text-border">|</span>
                <span>{story.regions.join(", ")}</span>
              </>
            )}
          </div>
        </header>

        {/* Thumbnail */}
        {story.thumbnail_url && (
          <div className="mb-10 overflow-hidden rounded-2xl">
            <img
              src={story.thumbnail_url}
              alt={story.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Body */}
        <StoryContent html={story.content ?? ""} />

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Related stories */}
      {relatedStories.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
            <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground lg:mb-8 lg:text-2xl">
              관련 스토리
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedStories.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
