"use client";

import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart-context";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  const effectivePrice = item.salePrice ?? item.price;
  const hasDiscount = item.salePrice !== null && item.salePrice < item.price;

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      {/* Thumbnail */}
      <Link
        href={`/products/${item.slug}`}
        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-primary-light"
      >
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/30">
            <svg
              width="24"
              height="24"
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
      </Link>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="block truncate text-sm font-bold text-foreground hover:text-primary"
            >
              {item.name}
            </Link>
            {item.region && (
              <span className="mt-0.5 inline-block text-xs text-muted">
                {item.region}
              </span>
            )}
            {Object.keys(item.selectedOptions).length > 0 && (
              <p className="mt-0.5 text-xs text-muted">
                {Object.entries(item.selectedOptions)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" / ")}
              </p>
            )}
          </div>
          <button
            onClick={onRemove}
            className="flex-shrink-0 text-muted transition-colors hover:text-red-500"
            aria-label="삭제"
          >
            <svg
              width="18"
              height="18"
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
        </div>

        <div className="mt-3 flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center text-sm text-muted transition-colors hover:text-foreground"
            >
              -
            </button>
            <span className="flex h-8 w-8 items-center justify-center border-x border-border text-xs font-medium text-foreground">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center text-sm text-muted transition-colors hover:text-foreground"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            {hasDiscount && (
              <span className="block text-xs text-muted line-through">
                {formatPrice(item.price * item.quantity)}
              </span>
            )}
            <span className="text-sm font-bold text-foreground">
              {formatPrice(effectivePrice * item.quantity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } =
    useCart();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            장바구니가 비어있습니다
          </h1>
          <p className="mt-2 text-sm text-muted">
            마음에 드는 상품을 담아보세요
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
          >
            상품 둘러보기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          장바구니
          <span className="ml-2 text-base font-normal text-muted">
            ({totalItems}개)
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted transition-colors hover:text-red-500"
        >
          전체 삭제
        </button>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <CartItemRow
            key={`${item.productId}-${index}`}
            item={item}
            onUpdateQuantity={(qty) =>
              updateQuantity(item.productId, item.selectedOptions, qty)
            }
            onRemove={() => removeItem(item.productId, item.selectedOptions)}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">상품금액</span>
            <span className="font-medium text-foreground">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">배송비</span>
            <span className="font-medium text-foreground">주문 시 계산</span>
          </div>
          <hr className="border-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              총 결제금액
            </span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <Link
          href="/products"
          className="flex flex-1 items-center justify-center rounded-xl border-2 border-border py-3.5 text-sm font-bold text-foreground transition-colors hover:border-primary/30"
        >
          쇼핑 계속하기
        </Link>
        <button className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary/90">
          주문하기
        </button>
      </div>
    </section>
  );
}
