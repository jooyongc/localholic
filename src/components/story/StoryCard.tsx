import Link from "next/link";
import type { Story } from "@/types/database";

export default function StoryCard({ story }: { story: Story }) {
  const date = story.published_at
    ? new Date(story.published_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-primary-light">
        {story.thumbnail_url ? (
          <img
            src={story.thumbnail_url}
            alt={story.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-primary/30">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        )}
        {story.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur-sm">
            {story.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {story.title}
        </h3>
        {story.meta_description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {story.meta_description}
          </p>
        )}
        {date && (
          <time className="mt-3 block text-xs text-muted/70">{date}</time>
        )}
      </div>
    </Link>
  );
}
