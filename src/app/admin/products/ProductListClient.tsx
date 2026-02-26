"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_CATEGORIES, PRODUCT_STATUS_MAP } from "@/lib/constants/product";
import type { Product } from "@/types/database";

type StatusFilter = "all" | "draft" | "active" | "sold_out" | "archived";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "draft", label: "임시저장" },
  { key: "active", label: "판매중" },
  { key: "sold_out", label: "품절" },
  { key: "archived", label: "보관" },
];

export default function ProductListClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  async function handleDelete(product: Product) {
    if (!confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) return;

    setDeleting(product.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      alert("삭제 실패: " + error.message);
      setDeleting(null);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setDeleting(null);
  }

  function formatPrice(p: number) {
    return p.toLocaleString("ko-KR") + "원";
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
            지역상품 관리
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {products.length}개 상품
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          새 상품
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Status tabs */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.key === "all"
                  ? products.length
                  : products.filter((p) => p.status === tab.key).length;
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
        </div>

        <div className="flex items-center gap-2">
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">모든 카테고리</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

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
              placeholder="상품명 검색..."
              className="h-9 rounded-lg border border-gray-300 pl-9 pr-4 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
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
                    상품
                  </th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 sm:table-cell">
                    카테고리
                  </th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 md:table-cell">
                    지역
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">
                    가격
                  </th>
                  <th className="hidden px-5 py-3 text-right font-semibold text-gray-600 lg:table-cell">
                    재고
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    상태
                  </th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-gray-600 sm:table-cell">
                    등록일
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => {
                  const status =
                    PRODUCT_STATUS_MAP[product.status] ??
                    PRODUCT_STATUS_MAP.draft;
                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {product.thumbnail_url && (
                            <img
                              src={product.thumbnail_url}
                              alt=""
                              className="hidden h-10 w-10 flex-shrink-0 rounded-lg object-cover sm:block"
                            />
                          )}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-medium text-gray-900 hover:text-emerald-600"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 text-gray-500 sm:table-cell">
                        {product.category || "-"}
                      </td>
                      <td className="hidden px-5 py-3 text-gray-500 md:table-cell">
                        {product.region || "-"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {product.sale_price ? (
                          <div>
                            <span className="text-red-600 font-medium">
                              {formatPrice(product.sale_price)}
                            </span>
                            <span className="ml-1 text-xs text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </td>
                      <td className="hidden px-5 py-3 text-right lg:table-cell">
                        <span
                          className={
                            product.stock_quantity <= 5
                              ? "font-medium text-red-600"
                              : "text-gray-500"
                          }
                        >
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3 text-gray-500 sm:table-cell">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                          >
                            편집
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deleting === product.id}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting === product.id ? "삭제 중" : "삭제"}
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
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="mt-3 text-sm">
            {search
              ? "검색 결과가 없습니다"
              : "아직 등록된 상품이 없습니다"}
          </p>
          {!search && (
            <Link
              href="/admin/products/new"
              className="mt-3 text-sm font-medium text-emerald-600 hover:underline"
            >
              첫 상품 등록하기
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
