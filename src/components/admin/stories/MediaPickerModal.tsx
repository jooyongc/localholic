"use client";

import { useState, useEffect } from "react";
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

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open]);

  async function loadMedia() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("media")
      .select("id, file_name, file_url, file_type, file_size, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    setMedia(data ?? []);
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">미디어 선택</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {showUploader ? "목록 보기" : "새 업로드"}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {showUploader ? (
            <ImageUploader
              onUploadComplete={() => {
                setShowUploader(false);
                loadMedia();
              }}
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-400">
              불러오는 중...
            </div>
          ) : media.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.file_url);
                    onClose();
                  }}
                  className="group relative aspect-square overflow-hidden rounded-xl border-2 border-gray-200 transition-all hover:border-emerald-400"
                >
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="w-full truncate px-2 pb-2 text-xs text-white">
                      {item.file_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm">미디어가 없습니다</p>
              <button
                onClick={() => setShowUploader(true)}
                className="mt-2 text-sm font-medium text-emerald-600 hover:underline"
              >
                이미지 업로드하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
