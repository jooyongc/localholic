"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils/slugify";
import {
  STORY_CATEGORIES,
  STORY_REGIONS,
} from "@/lib/constants/story";
import type { Story } from "@/types/database";
import ImageUploader from "@/components/ui/ImageUploader";
import MediaPickerModal from "./MediaPickerModal";

interface StoryFormProps {
  initialData?: Story;
}

export default function StoryForm({ initialData }: StoryFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [regions, setRegions] = useState<string[]>(initialData?.regions ?? []);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url ?? "");
  const [content, setContent] = useState(initialData?.raw_content ?? initialData?.content ?? "");
  const [tags, setTags] = useState(initialData?.tags?.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<"thumbnail" | "inline">("thumbnail");

  function toggleRegion(region: string) {
    setRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  }

  const handleThumbnailUpload = useCallback(
    (files: { file_url: string }[]) => {
      if (files[0]) setThumbnailUrl(files[0].file_url);
    },
    []
  );

  function insertInlineImage(url: string) {
    const imageMarkdown = `\n![이미지](${url})\n`;
    setContent((prev) => prev + imageMarkdown);
  }

  function insertVideoLink() {
    const url = prompt("영상 URL을 입력하세요 (YouTube, Vimeo 등)");
    if (url) {
      const videoMarkdown = `\n[영상 보기](${url})\n`;
      setContent((prev) => prev + videoMarkdown);
    }
  }

  async function handleSave(status: "draft" | "published") {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인이 필요합니다.");
      setSaving(false);
      return;
    }

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const storyData = {
      title: title.trim(),
      slug: isEdit ? initialData.slug : slugify(title),
      content: content,
      raw_content: content,
      thumbnail_url: thumbnailUrl || null,
      category: category || null,
      tags: parsedTags,
      regions,
      meta_title: title.trim(),
      meta_description: content.slice(0, 160) || null,
      status,
      ...(status === "published" && !initialData?.published_at
        ? { published_at: new Date().toISOString() }
        : {}),
    };

    let error;

    if (isEdit) {
      ({ error } = await supabase
        .from("stories")
        .update(storyData)
        .eq("id", initialData.id));
    } else {
      ({ error } = await supabase.from("stories").insert({
        ...storyData,
        author_id: user.id,
      }));
    }

    setSaving(false);

    if (error) {
      alert("저장 실패: " + error.message);
      return;
    }

    router.push("/admin/stories");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          {isEdit ? "스토리 편집" : "새 스토리 작성"}
        </h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          뒤로가기
        </button>
      </div>

      {/* Title */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="스토리 제목을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Category & Regions */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Category */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            카테고리
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">선택하세요</option>
            {STORY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Regions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            지역 <span className="font-normal text-gray-400">(복수 선택 가능)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {STORY_REGIONS.map((region) => {
              const selected = regions.includes(region);
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          썸네일
        </label>
        {thumbnailUrl ? (
          <div className="relative mb-3 inline-block">
            <img
              src={thumbnailUrl}
              alt="썸네일"
              className="h-40 rounded-lg object-cover"
            />
            <button
              onClick={() => setThumbnailUrl("")}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow transition-colors hover:bg-red-600"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <ImageUploader
              multiple={false}
              onUploadComplete={handleThumbnailUpload}
            />
          </div>
        )}
        {!thumbnailUrl && (
          <button
            type="button"
            onClick={() => {
              setMediaPickerMode("thumbnail");
              setMediaPickerOpen(true);
            }}
            className="mt-2 text-sm font-medium text-emerald-600 hover:underline"
          >
            미디어 라이브러리에서 선택
          </button>
        )}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          본문
        </label>
        {/* Toolbar */}
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMediaPickerMode("inline");
              setMediaPickerOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            이미지 삽입
          </button>
          <button
            type="button"
            onClick={insertVideoLink}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            영상 링크
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          placeholder="스토리 본문을 작성하세요..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-relaxed transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Tags */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          태그 <span className="font-normal text-gray-400">(쉼표로 구분)</span>
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="예: 맛집, 서울, 한옥"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button"
          disabled
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-400 opacity-50"
          title="준비 중"
        >
          AI 생성
        </button>
        <button
          type="button"
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "임시저장"}
        </button>
        <button
          type="button"
          onClick={() => handleSave("published")}
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "발행하기"}
        </button>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => {
          if (mediaPickerMode === "thumbnail") {
            setThumbnailUrl(url);
          } else {
            insertInlineImage(url);
          }
        }}
      />
    </div>
  );
}
