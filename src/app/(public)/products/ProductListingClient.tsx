"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types/database";
import { PRODUCT_CATEGORIES, PRODUCT_REGIONS } from "@/lib/constants/product";
import ProductCard from "@/components/shop/ProductCard";
import EmptyState from "@/components/ui/EmptyState";

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
] as const;

const PAGE_SIZE = 12;
const REGION_KEYS = Object.keys(PRODUCT_REGIONS);

function effectivePrice(p: Product) {
  return p.sale_price !== null && p.sale_price < p.price
    ? p.sale_price
    : p.price;
}

export default function ProductListingClient({
  products,
}: {
  products: Product[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filter state from URL
  const selectedCategories = searchParams.getAll("category");
  const selectedRegions = searchParams.getAll("region");
  const sort = searchParams.get("sort") ?? "latest";
  const minPrice = parseInt(searchParams.get("minPrice") ?? "0", 10) || 0;
  const maxPrice =
    parseInt(searchParams.get("maxPrice") ?? "0", 10) || 0;
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1
  );

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Build new URL params
  function updateParams(updates: Record<string, string | string[] | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      params.delete(key);
      if (value === null) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    }
    // Reset page when filters change (unless explicitly setting page)
    if (!("page" in updates)) {
      params.delete("page");
    }
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function toggleArrayParam(key: string, value: string) {
    const current = searchParams.getAll(key);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: next.length > 0 ? next : null });
  }

  // Filter & sort
  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter(
        (p) => p.category && selectedCategories.includes(p.category)
      );
    }

    if (selectedRegions.length > 0) {
      result = result.filter(
        (p) =>
          p.region &&
          selectedRegions.some((r) => p.region!.startsWith(r))
      );
    }

    if (minPrice > 0) {
      result = result.filter((p) => effectivePrice(p) >= minPrice);
    }
    if (maxPrice > 0) {
      result = result.filter((p) => effectivePrice(p) <= maxPrice);
    }

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case "price_desc":
        result.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case "popular":
        result.sort(
          (a, b) =>
            (b.stock_quantity > 0 ? 1 : 0) - (a.stock_quantity > 0 ? 1 : 0)
        );
        break;
      default:
        break; // already sorted by latest
    }

    return result;
  }, [products, selectedCategories, selectedRegions, sort, minPrice, maxPrice]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilterCount =
    selectedCategories.length +
    selectedRegions.length +
    (minPrice > 0 ? 1 : 0) +
    (maxPrice > 0 ? 1 : 0);

  const filterSidebar = (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-foreground">카테고리</h3>
        <div className="space-y-2">
          {PRODUCT_CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80 hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleArrayParam("category", cat)}
                className="h-4 w-4 rounded border-border text-primary accent-primary"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Region */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-foreground">지역</h3>
        <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
          {REGION_KEYS.map((region) => (
            <label
              key={region}
              className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80 hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={selectedRegions.includes(region)}
                onChange={() => toggleArrayParam("region", region)}
                className="h-4 w-4 rounded border-border text-primary accent-primary"
              />
              {region}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-foreground">가격 범위</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="최소"
            value={minPrice || ""}
            onChange={(e) =>
              updateParams({ minPrice: e.target.value || null })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <span className="text-sm text-muted">~</span>
          <input
            type="number"
            placeholder="최대"
            value={maxPrice || ""}
            onChange={(e) =>
              updateParams({ maxPrice: e.target.value || null })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <button
          onClick={() =>
            updateParams({
              category: null,
              region: null,
              minPrice: null,
              maxPrice: null,
            })
          }
          className="w-full rounded-lg border border-border py-2 text-sm font-medium text-muted transition-colors hover:border-primary/30 hover:text-foreground"
        >
          필터 초기화
        </button>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:py-16">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          지역상품
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          전국 각지의 특산품과 로컬 상품을 만나보세요
        </p>
      </div>

      {/* Mobile filter toggle */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          필터
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort (mobile) */}
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile filter panel */}
      {mobileFilterOpen && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5 lg:hidden">
          {filterSidebar}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
            {filterSidebar}
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Sort & count (desktop) */}
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <p className="text-sm text-muted">
              총 <span className="font-bold text-foreground">{filtered.length}</span>개 상품
            </p>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product grid */}
          {paginated.length > 0 ? (
            <>
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2">
                  {currentPage > 1 && (
                    <button
                      onClick={() =>
                        updateParams({ page: String(currentPage - 1) })
                      }
                      className="flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-muted transition-colors hover:border-primary/30 hover:text-foreground"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="mr-1"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                      이전
                    </button>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 2
                    )
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] ?? 0) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "..." ? (
                        <span key={`dot-${i}`} className="px-1 text-muted">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() =>
                            updateParams({ page: String(item) })
                          }
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            item === currentPage
                              ? "bg-primary text-white"
                              : "border border-border bg-card text-muted hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  {currentPage < totalPages && (
                    <button
                      onClick={() =>
                        updateParams({ page: String(currentPage + 1) })
                      }
                      className="flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-muted transition-colors hover:border-primary/30 hover:text-foreground"
                    >
                      다음
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="ml-1"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  )}
                </nav>
              )}
            </>
          ) : (
            <EmptyState
              message={
                activeFilterCount > 0
                  ? "선택한 조건에 맞는 상품이 없습니다"
                  : "아직 등록된 상품이 없습니다"
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}
