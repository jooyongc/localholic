"use client";

import { useState, useRef, useCallback } from "react";

interface UploadedFile {
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

interface ImageUploaderProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  multiple?: boolean;
}

interface PreviewFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  result?: UploadedFile;
}

export default function ImageUploader({
  onUploadComplete,
  multiple = true,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const newFiles: PreviewFile[] = Array.from(fileList).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "pending" as const,
      }));
      setFiles((prev) => (multiple ? [...prev, ...newFiles] : newFiles));
    },
    [multiple]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const f = prev.find((p) => p.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function uploadAll() {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;

    // Mark all as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" as const, progress: 0 } : f
      )
    );

    const formData = new FormData();
    pending.forEach((f) => formData.append("files", f.file));

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "uploading" && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await res.json();

      if (!res.ok) {
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "uploading"
              ? { ...f, status: "error" as const, progress: 0, error: data.error || "업로드 실패" }
              : f
          )
        );
        return;
      }

      const uploaded: UploadedFile[] = data.results ?? [];
      const errors: string[] = data.errors ?? [];

      setFiles((prev) =>
        prev.map((f) => {
          if (f.status !== "uploading") return f;

          const matchedResult = uploaded.find((r) => r.file_name === f.file.name);
          const matchedError = errors.find((e) => e.startsWith(f.file.name));

          if (matchedResult) {
            return { ...f, status: "done" as const, progress: 100, result: matchedResult };
          }
          if (matchedError) {
            return { ...f, status: "error" as const, progress: 0, error: matchedError };
          }
          return { ...f, status: "done" as const, progress: 100 };
        })
      );

      if (uploaded.length > 0) {
        onUploadComplete?.(uploaded);
      }
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error" as const, progress: 0, error: "네트워크 오류" }
            : f
        )
      );
    }
  }

  const hasPending = files.some((f) => f.status === "pending");
  const isUploading = files.some((f) => f.status === "uploading");

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
          dragOver
            ? "border-emerald-400 bg-emerald-50"
            : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={dragOver ? "text-emerald-500" : "text-gray-400"}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="mt-3 text-sm font-medium text-gray-600">
          이미지를 드래그하거나 클릭하여 업로드
        </p>
        <p className="mt-1 text-xs text-gray-400">
          JPG, PNG, WebP, GIF (최대 10MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((f) => (
              <div
                key={f.id}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                {/* Preview */}
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={f.result?.file_url || f.preview}
                    alt={f.file.name}
                    className="h-full w-full object-cover"
                  />
                  {/* Progress overlay */}
                  {f.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-3/4">
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/30">
                          <div
                            className="h-full rounded-full bg-white transition-all duration-300"
                            style={{ width: `${f.progress}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-center text-xs font-medium text-white">
                          {f.progress}%
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Status badge */}
                  {f.status === "done" && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  {f.status === "error" && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  )}
                  {/* Remove button */}
                  {(f.status === "pending" || f.status === "error") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(f.id);
                      }}
                      className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                {/* Info */}
                <div className="px-3 py-2">
                  <p className="truncate text-xs font-medium text-gray-700">
                    {f.file.name}
                  </p>
                  {f.error && (
                    <p className="mt-0.5 truncate text-[11px] text-red-500">{f.error}</p>
                  )}
                  <p className="text-[11px] text-gray-400">
                    {(f.file.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload button */}
          {hasPending && (
            <button
              onClick={uploadAll}
              disabled={isUploading}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? "업로드 중..." : `${files.filter((f) => f.status === "pending").length}개 파일 업로드`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
