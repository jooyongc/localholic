"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { STORY_STATUS_MAP } from "@/lib/constants/story";
import type { Story } from "@/types/database";

type StatusFilter = "all" | "draft" | "published" | "archived";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "draft", label: "임시저장" },
  { key: "published", label: "발행됨" },
  { key: "archived", label: "보관됨" },
];

export default function StoryListClient({
  initialStories,
}: {
  initialStories: Story[];
}) {
  const router = useRouter();
  const [stories, setStories] = useState(initialStories);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = stories.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  async function handleDelete(story: Story) {
    if (!confirm(`"${story.title}" 스토리를 삭제하시겠습니까?`)) return;

    setDeleting(story.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("stories")
      .delete()
      .eq("id", story.id);

    if (error) {
      alert("삭제 실패: " + error.message);
      setDeleting(null);
      return;
    }

    setStories((prev) => prev.filter((s) => s.id !== story.id));
    setDeleting(null);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
            스토리 관리
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {stories.length}개 스토리
          </p>
        </div>
        <Link
          href="/admin/stories/new"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          새 스토리
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status tabs */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.key === "all"
                ? stories.length
                : stories.filter((s) => s.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목 검색..."
            className="h-9 rounded-lg border border-gray-300 pl-9 pr-4 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    제목
                  </th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 sm:table-cell">
                    카테고리
                  </th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 md:table-cell">
                    지역
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    상태
                  </th>
                  <th className="hidden px-5 py-3 text-right font-semibold text-gray-600 lg:table-cell">
                    조회수
                  </th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 sm:table-cell">
                    작성일
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((story) => {
                  const status =
                    STORY_STATUS_MAP[story.status] ?? STORY_STATUS_MAP.draft;
                  return (
                    <tr
                      key={story.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/stories/${story.id}/edit`}
                          className="font-medium text-gray-900 hover:text-emerald-600"
                        >
                          {story.title}
                        </Link>
                      </td>
                      <td className="hidden px-5 py-3 text-gray-500 sm:table-cell">
                        {story.category || "-"}
                      </td>
                      <td className="hidden px-5 py-3 md:table-cell">
                        {story.regions?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {story.regions.slice(0, 3).map((r) => (
                              <span
                                key={r}
                                className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600"
                              >
                                {r}
                              </span>
                            ))}
                            {story.regions.length > 3 && (
                              <span className="text-[11px] text-gray-400">
                                +{story.regions.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3 text-right text-gray-500 lg:table-cell">
                        {story.view_count.toLocaleString()}
                      </td>
                      <td className="hidden px-5 py-3 text-gray-500 sm:table-cell">
                        {formatDate(story.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/stories/${story.id}/edit`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                          >
                            편집
                          </Link>
                          <button
                            onClick={() => handleDelete(story)}
                            disabled={deleting === story.id}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting === story.id ? "삭제 중" : "삭제"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-gray-400">
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
          <p className="mt-3 text-sm">
            {search
              ? "검색 결과가 없습니다"
              : "아직 작성된 스토리가 없습니다"}
          </p>
          {!search && (
            <Link
              href="/admin/stories/new"
              className="mt-3 text-sm font-medium text-emerald-600 hover:underline"
            >
              첫 스토리 작성하기
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
