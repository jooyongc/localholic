import Link from "next/link";
import type { Product } from "@/types/database";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    product.sale_price !== null && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.sale_price! / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-primary-light">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
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
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {discountPercent}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {product.region && (
          <span className="mb-1.5 inline-block rounded-md bg-accent-light px-2 py-0.5 text-[11px] font-medium text-accent">
            {product.region}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-base font-bold text-primary">
                {formatPrice(product.sale_price!)}
              </span>
              <span className="text-xs text-muted line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
