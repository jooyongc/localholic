import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import ProductListingClient from "./ProductListingClient";

export const metadata = {
  title: "지역상품",
  description:
    "전국 각 지역의 특산품과 로컬 상품을 만나보세요. 농산물, 수산물, 가공식품, 공예품 등 다양한 로컬 상품을 큐레이션합니다.",
};

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return <ProductListingClient products={(data ?? []) as Product[]} />;
}
