"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/database";
import { useCart } from "@/lib/cart-context";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function ProductDetailClient({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const allImages = [
    product.thumbnail_url,
    ...product.images,
  ].filter(Boolean) as string[];

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const defaults: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      product.options.forEach((opt) => {
        if (opt.values.length > 0) {
          defaults[opt.name] = opt.values[0];
        }
      });
    }
    return defaults;
  });
  const [zoomOpen, setZoomOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const hasDiscount =
    product.sale_price !== null && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.sale_price! / product.price) * 100)
    : 0;
  const basePrice = hasDiscount ? product.sale_price! : product.price;

  // Calculate extra price from options
  const extraPrice = product.options
    ? product.options.reduce((sum, opt) => {
        const selectedValue = selectedOptions[opt.name];
        if (selectedValue && opt.values.indexOf(selectedValue) > 0) {
          return sum + opt.extra_price;
        }
        return sum;
      }, 0)
    : 0;

  const unitPrice = basePrice + extraPrice;
  const totalPrice = unitPrice * quantity;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price,
      thumbnailUrl: product.thumbnail_url,
      region: product.region,
      quantity,
      selectedOptions,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  const cleanContent = useMemo(() => {
    if (!product.content) return null;
    if (typeof window === "undefined") return product.content;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DOMPurify = require("dompurify");
    return DOMPurify.sanitize(product.content, {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "br", "hr",
        "ul", "ol", "li",
        "strong", "em", "b", "i", "u", "s",
        "a", "img", "figure", "figcaption",
        "blockquote", "pre", "code",
        "table", "thead", "tbody", "tr", "th", "td",
        "div", "span",
      ],
      ALLOWED_ATTR: [
        "href", "target", "rel",
        "src", "alt", "width", "height",
        "class", "id",
      ],
    });
  }, [product.content]);

  return (
    <>
      <div className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Left: Image gallery */}
          <div className="w-full lg:w-1/2">
            {/* Main image */}
            <div
              className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-primary-light"
              onClick={() => allImages.length > 0 && setZoomOpen(true)}
            >
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-primary/30">
                  <svg
                    width="64"
                    height="64"
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
                </div>
              )}
              {hasDiscount && (
                <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === i
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="w-full lg:w-1/2">
            {/* Category & region */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {product.category && (
                <span className="rounded-md bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                  {product.category}
                </span>
              )}
              {product.region && (
                <span className="rounded-md bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">
                  {product.region}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-xl font-bold leading-snug tracking-tight text-foreground lg:text-2xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-bold text-primary lg:text-3xl">
                    {formatPrice(product.sale_price!)}
                  </span>
                  <span className="text-base text-muted line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-bold text-red-500">
                    {discountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-foreground lg:text-3xl">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {product.description}
              </p>
            )}

            {/* Shipping info */}
            {product.shipping_info && (
              <div className="mt-4 rounded-lg bg-card border border-border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary"
                  >
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span className="font-medium text-foreground">
                    {product.shipping_info.method ?? "택배"}
                  </span>
                  {product.shipping_info.cost !== undefined && (
                    <span className="text-muted">
                      {product.shipping_info.cost === 0
                        ? "무료배송"
                        : `배송비 ${formatPrice(product.shipping_info.cost)}`}
                    </span>
                  )}
                </div>
                {product.shipping_info.free_threshold !== undefined &&
                  product.shipping_info.free_threshold > 0 && (
                    <p className="mt-1 text-xs text-muted">
                      {formatPrice(product.shipping_info.free_threshold)} 이상
                      구매 시 무료배송
                    </p>
                  )}
                {product.shipping_info.note && (
                  <p className="mt-1 text-xs text-muted">
                    {product.shipping_info.note}
                  </p>
                )}
              </div>
            )}

            <hr className="my-5 border-border" />

            {/* Options */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-4">
                {product.options.map((opt) => (
                  <div key={opt.name}>
                    <label className="mb-1.5 block text-sm font-bold text-foreground">
                      {opt.name}
                      {opt.extra_price > 0 && (
                        <span className="ml-1 text-xs font-normal text-muted">
                          (+{formatPrice(opt.extra_price)})
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedOptions[opt.name] ?? ""}
                      onChange={(e) =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [opt.name]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                    >
                      {opt.values.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <hr className="border-border" />
              </div>
            )}

            {/* Quantity */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">수량</span>
              <div className="flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:text-foreground"
                >
                  -
                </button>
                <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:text-foreground"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total price */}
            <div className="mt-5 flex items-center justify-between rounded-lg bg-primary-light px-4 py-3">
              <span className="text-sm font-medium text-foreground">
                총 상품금액
              </span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className="flex-1 rounded-xl border-2 border-primary py-3.5 text-sm font-bold text-primary transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                {addedToCart ? "담았습니다!" : "장바구니"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
                className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {product.stock_quantity > 0 ? "바로구매" : "품절"}
              </button>
            </div>

            {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
              <p className="mt-2 text-center text-xs text-red-500">
                남은 수량: {product.stock_quantity}개
              </p>
            )}
          </div>
        </div>

        {/* AI content / product detail */}
        {cleanContent && (
          <div className="mt-12 border-t border-border pt-10">
            <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground lg:text-2xl">
              상품 상세정보
            </h2>
            <div
              className="prose prose-lg max-w-none text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-p:leading-relaxed prose-p:text-foreground/80 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-primary/30 prose-blockquote:text-muted"
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoomOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={allImages[selectedImage]}
            alt={product.name}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(
                    (prev) => (prev - 1 + allImages.length) % allImages.length
                  );
                }}
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(
                    (prev) => (prev + 1) % allImages.length
                  );
                }}
                className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
