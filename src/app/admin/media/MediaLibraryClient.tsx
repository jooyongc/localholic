"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "@/components/ui/ImageUploader";

interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export default function MediaLibraryClient({
  initialMedia,
}: {
  initialMedia: MediaItem[];
}) {
  const router = useRouter();
  const [media, setMedia] = useState(initialMedia);
  const [selected, setSelected] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const selectedItem = media.find((m) => m.id === selected);

  async function handleDelete(item: MediaItem) {
    if (!confirm(`"${item.file_name}" 파일을 삭제하시겠습니까?`)) return;

    setDeleting(item.id);
    const supabase = createClient();

    // Extract storage path from URL
    const url = new URL(item.file_url);
    const pathParts = url.pathname.split("/storage/v1/object/public/media/");
    const storagePath = pathParts[1];

    if (storagePath) {
      await supabase.storage.from("media").remove([storagePath]);
    }

    await supabase.from("media").delete().eq("id", item.id);

    setMedia((prev) => prev.filter((m) => m.id !== item.id));
    if (selected === item.id) setSelected(null);
    setDeleting(null);
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
            미디어 라이브러리
          </h1>
          <p className="mt-1 text-sm text-gray-500">{media.length}개 파일</p>
        </div>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          {showUploader ? "닫기" : "업로드"}
        </button>
      </div>

      {/* Uploader */}
      {showUploader && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <ImageUploader
            onUploadComplete={() => {
              router.refresh();
              setShowUploader(false);
              // Refresh media list from server
              setTimeout(() => router.refresh(), 500);
            }}
          />
        </div>
      )}

      {/* Grid + Detail panel */}
      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1">
          {media.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item.id === selected ? null : item.id)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    item.id === selected
                      ? "border-emerald-500 ring-2 ring-emerald-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="h-full w-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="w-full truncate px-2 pb-2 text-xs text-white">
                      {item.file_name}
                    </p>
                  </div>
                  {/* Selected check */}
                  {item.id === selected && (
                    <div className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="mt-3 text-sm">업로드된 미디어가 없습니다</p>
              <button
                onClick={() => setShowUploader(true)}
                className="mt-3 text-sm font-medium text-emerald-600 hover:underline"
              >
                첫 이미지 업로드하기
              </button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-4">
              <img
                src={selectedItem.file_url}
                alt={selectedItem.file_name}
                className="aspect-video w-full rounded-lg object-cover"
              />
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-400">파일명</p>
                  <p className="mt-0.5 break-all text-sm font-medium text-gray-900">
                    {selectedItem.file_name}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-gray-400">크기</p>
                    <p className="mt-0.5 text-sm text-gray-700">
                      {formatSize(selectedItem.file_size)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">업로드</p>
                    <p className="mt-0.5 text-sm text-gray-700">
                      {formatDate(selectedItem.created_at)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">URL</p>
                  <div className="mt-1 flex gap-1">
                    <input
                      readOnly
                      value={selectedItem.file_url}
                      className="h-8 flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-600"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedItem.file_url)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                      title="URL 복사"
                    >
                      {copied ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-500">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(selectedItem)}
                  disabled={deleting === selectedItem.id}
                  className="w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting === selectedItem.id ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
