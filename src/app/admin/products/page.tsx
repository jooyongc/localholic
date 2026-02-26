import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import ProductListClient from "./ProductListClient";

export const metadata = { title: "지역상품 관리" };

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return <ProductListClient initialProducts={(data ?? []) as Product[]} />;
}
