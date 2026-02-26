"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils/slugify";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_REGIONS,
  SHIPPING_METHODS,
} from "@/lib/constants/product";
import type { Product, ProductOption, ShippingInfo } from "@/types/database";
import ImageUploader from "@/components/ui/ImageUploader";

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  // Basic info
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [sido, setSido] = useState(() => {
    if (!initialData?.region) return "";
    const parts = initialData.region.split(" ");
    return parts[0] ?? "";
  });
  const [sigungu, setSigungu] = useState(() => {
    if (!initialData?.region) return "";
    const parts = initialData.region.split(" ");
    return parts.slice(1).join(" ");
  });
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [salePrice, setSalePrice] = useState(
    initialData?.sale_price?.toString() ?? ""
  );
  const [stockQuantity, setStockQuantity] = useState(
    initialData?.stock_quantity?.toString() ?? "0"
  );
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );

  // Images
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnail_url ?? ""
  );
  const [images, setImages] = useState<string[]>(
    initialData?.images ?? []
  );
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Options
  const [options, setOptions] = useState<ProductOption[]>(
    initialData?.options ?? []
  );

  // Shipping
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(
    initialData?.shipping_info ?? { method: "택배", cost: 3000 }
  );

  // Content (AI generated)
  const [content, setContent] = useState(initialData?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initialData?.meta_description ?? ""
  );

  // UI states
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Region helpers
  const sigunguList = sido ? PRODUCT_REGIONS[sido] ?? [] : [];
  const regionString = sido
    ? sigungu
      ? `${sido} ${sigungu}`
      : sido
    : "";

  // Thumbnail upload
  const handleThumbnailUpload = useCallback(
    (files: { file_url: string }[]) => {
      if (files[0]) setThumbnailUrl(files[0].file_url);
    },
    []
  );

  // Additional images upload
  const handleImagesUpload = useCallback(
    (files: { file_url: string }[]) => {
      setImages((prev) => {
        const newUrls = files.map((f) => f.file_url);
        const combined = [...prev, ...newUrls];
        return combined.slice(0, 10);
      });
    },
    []
  );

  // Drag reorder
  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...images];
    const [removed] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, removed);
    setImages(updated);
    dragItem.current = null;
    dragOverItem.current = null;
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  // Options management
  function addOption() {
    setOptions((prev) => [
      ...prev,
      { name: "", values: [""], extra_price: 0 },
    ]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateOption(index: number, field: keyof ProductOption, value: string | string[] | number) {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  }

  // AI Generate
  async function handleAIGenerate() {
    if (!name.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/ai/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          region: regionString,
          price: parseInt(price) || 0,
          description,
          images: [thumbnailUrl, ...images].filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "AI 생성 실패");
        setGenerating(false);
        return;
      }

      setContent(data.html);
      if (data.meta_title) setMetaTitle(data.meta_title);
      if (data.meta_description) setMetaDescription(data.meta_description);
      setShowPreview(true);
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    }
    setGenerating(false);
  }

  // Save
  async function handleSave(status: "draft" | "active") {
    if (!name.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }
    if (!price || parseInt(price) <= 0) {
      alert("가격을 입력해주세요.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const productData = {
      name: name.trim(),
      slug: isEdit ? initialData.slug : slugify(name),
      description: description || null,
      content: content || null,
      price: parseInt(price),
      sale_price: salePrice ? parseInt(salePrice) : null,
      stock_quantity: parseInt(stockQuantity) || 0,
      category: category || null,
      region: regionString || null,
      images,
      thumbnail_url: thumbnailUrl || null,
      options,
      shipping_info: shippingInfo,
      status,
      meta_title: metaTitle || name.trim(),
      meta_description: metaDescription || description?.slice(0, 160) || null,
    };

    let error;

    if (isEdit) {
      ({ error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", initialData.id));
    } else {
      ({ error } = await supabase.from("products").insert(productData));
    }

    setSaving(false);

    if (error) {
      alert("저장 실패: " + error.message);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          {isEdit ? "상품 편집" : "새 상품 등록"}
        </h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          뒤로가기
        </button>
      </div>

      {/* Product Name */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          상품명
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="상품명을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Category & Region */}
      <div className="grid gap-5 lg:grid-cols-2">
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
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            지역
          </label>
          <div className="flex gap-2">
            <select
              value={sido}
              onChange={(e) => {
                setSido(e.target.value);
                setSigungu("");
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">시/도</option>
              {Object.keys(PRODUCT_REGIONS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={sigungu}
              onChange={(e) => setSigungu(e.target.value)}
              disabled={!sido}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">시/군/구</option>
              {sigunguList.map((sg) => (
                <option key={sg} value={sg}>
                  {sg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Price & Stock */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            가격 (원)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            할인가격 (원) <span className="font-normal text-gray-400">선택</span>
          </label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="미입력 시 할인 없음"
            min="0"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            재고 수량
          </label>
          <input
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Thumbnail */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          대표 이미지
        </label>
        {thumbnailUrl ? (
          <div className="relative mb-3 inline-block">
            <img
              src={thumbnailUrl}
              alt="대표 이미지"
              className="h-40 rounded-lg object-cover"
            />
            <button
              onClick={() => setThumbnailUrl("")}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <ImageUploader multiple={false} onUploadComplete={handleThumbnailUpload} />
        )}
      </div>

      {/* Additional Images (drag reorder) */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          추가 이미지 <span className="font-normal text-gray-400">(최대 10장, 드래그로 순서 변경)</span>
        </label>
        {images.length > 0 && (
          <div className="mb-3 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {images.map((url, index) => (
              <div
                key={url + index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-gray-200 active:cursor-grabbing"
              >
                <img
                  src={url}
                  alt={`추가 이미지 ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-black/50 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < 10 && (
          <ImageUploader onUploadComplete={handleImagesUpload} />
        )}
      </div>

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          상품 기본 설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="상품의 기본 설명을 입력하세요. AI 상세페이지 생성 시 참고됩니다."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-relaxed transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Options */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            옵션 설정
          </label>
          <button
            type="button"
            onClick={addOption}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            + 옵션 추가
          </button>
        </div>
        {options.length > 0 ? (
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    옵션 {i + 1}
                  </span>
                  <button
                    onClick={() => removeOption(i)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      옵션명
                    </label>
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => updateOption(i, "name", e.target.value)}
                      placeholder="예: 용량"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      옵션값 (쉼표 구분)
                    </label>
                    <input
                      type="text"
                      value={opt.values.join(", ")}
                      onChange={(e) =>
                        updateOption(
                          i,
                          "values",
                          e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
                        )
                      }
                      placeholder="예: 500g, 1kg, 2kg"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      추가금액 (원)
                    </label>
                    <input
                      type="number"
                      value={opt.extra_price}
                      onChange={(e) =>
                        updateOption(i, "extra_price", parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                      min="0"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            옵션이 없습니다. 필요 시 추가해주세요.
          </p>
        )}
      </div>

      {/* Shipping Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="mb-3 block text-sm font-semibold text-gray-700">
          배송 정보
        </label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">배송방법</label>
            <select
              value={shippingInfo.method ?? "택배"}
              onChange={(e) =>
                setShippingInfo((prev) => ({ ...prev, method: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {SHIPPING_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">배송비 (원)</label>
            <input
              type="number"
              value={shippingInfo.cost ?? ""}
              onChange={(e) =>
                setShippingInfo((prev) => ({
                  ...prev,
                  cost: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="0"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">
              무료배송 기준 (원)
            </label>
            <input
              type="number"
              value={shippingInfo.free_threshold ?? ""}
              onChange={(e) =>
                setShippingInfo((prev) => ({
                  ...prev,
                  free_threshold: parseInt(e.target.value) || undefined,
                }))
              }
              placeholder="미입력 시 무료배송 없음"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">배송 안내</label>
            <input
              type="text"
              value={shippingInfo.note ?? ""}
              onChange={(e) =>
                setShippingInfo((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="예: 도서산간 추가 3,000원"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* AI Content Generation */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            상세페이지 (AI 생성)
          </label>
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
          >
            {generating ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                </svg>
                생성 중...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                AI 상세페이지 생성
              </>
            )}
          </button>
        </div>

        {content ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  showPreview
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {showPreview ? "HTML 편집" : "미리보기"}
              </button>
            </div>
            {showPreview ? (
              <div
                className="prose max-w-none rounded-lg border border-gray-200 bg-white p-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-xs leading-relaxed transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-gray-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <p className="mt-2 text-sm">
              상품 정보를 입력한 후 AI 생성 버튼을 클릭하세요
            </p>
          </div>
        )}
      </div>

      {/* SEO */}
      {(metaTitle || metaDescription) && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-3 block text-sm font-semibold text-gray-700">
            SEO 메타 정보
          </label>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                메타 제목
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                메타 설명
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
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
          onClick={() => handleSave("active")}
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "판매 등록"}
        </button>
      </div>
    </div>
  );
}
