import Link from "next/link";
import type { TravelProgram } from "@/types/database";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function TravelCard({ program }: { program: TravelProgram }) {
  const spotsLeft = program.max_participants - program.current_participants;
  const almostFull = spotsLeft > 0 && spotsLeft <= 3;

  return (
    <Link
      href={`/travel/${program.slug}`}
      className="group flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg lg:w-80"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-primary-light">
        {program.thumbnail_url ? (
          <img
            src={program.thumbnail_url}
            alt={program.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/30">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            >
              <circle cx="12" cy="10" r="3" />
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
            </svg>
          </div>
        )}
        {program.duration && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur-sm">
            {program.duration}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {program.region && (
          <span className="mb-1.5 inline-block w-fit rounded-md bg-accent-light px-2 py-0.5 text-[11px] font-medium text-accent">
            {program.region}
          </span>
        )}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {program.title}
        </h3>

        <div className="mt-auto flex items-end justify-between pt-4">
          <span className="text-lg font-bold text-primary">
            {formatPrice(program.price)}
          </span>
          <span
            className={`text-xs font-medium ${
              spotsLeft <= 0
                ? "text-muted"
                : almostFull
                  ? "text-red-500"
                  : "text-primary"
            }`}
          >
            {spotsLeft <= 0
              ? "마감"
              : almostFull
                ? `${spotsLeft}자리 남음`
                : `${program.current_participants}/${program.max_participants}명`}
          </span>
        </div>
      </div>
    </Link>
  );
}
