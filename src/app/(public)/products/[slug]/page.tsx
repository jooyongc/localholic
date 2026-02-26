import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import ProductCard from "@/components/shop/ProductCard";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 1800;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();
  return data as Product | null;
}

async function getRelatedProducts(
  productId: string,
  category: string | null
): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .neq("id", productId)
    .order("created_at", { ascending: false })
    .limit(4);

  if (category) {
    query = query.eq("category", category);
  }

  const { data } = await query;
  return (data ?? []) as Product[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "상품을 찾을 수 없습니다" };
  }

  const description =
    product.meta_description ||
    product.description?.slice(0, 160) ||
    "";

  return {
    title: product.meta_title || product.name,
    description,
    openGraph: {
      title: product.meta_title || product.name,
      description,
      type: "website",
      ...(product.thumbnail_url ? { images: [product.thumbnail_url] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: product.meta_title || product.name,
      description,
      ...(product.thumbnail_url ? { images: [product.thumbnail_url] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category
  );

  const hasDiscount =
    product.sale_price !== null && product.sale_price < product.price;
  const price = hasDiscount ? product.sale_price! : product.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.meta_description || product.description?.slice(0, 160) || "",
    ...(product.thumbnail_url ? { image: product.thumbnail_url } : {}),
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "KRW",
      availability:
        product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetailClient product={product} />

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
            <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground lg:mb-8 lg:text-2xl">
              관련 상품
            </h2>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
