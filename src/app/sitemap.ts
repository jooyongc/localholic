import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://localholic.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [stories, products, travel] = await Promise.all([
    supabase
      .from("stories")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("products")
      .select("slug, updated_at")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("travel_programs")
      .select("slug, updated_at")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/stories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/travel`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const storyPages: MetadataRoute.Sitemap = (stories.data ?? []).map((s) => ({
    url: `${BASE_URL}/stories/${s.slug}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = (products.data ?? []).map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const travelPages: MetadataRoute.Sitemap = (travel.data ?? []).map((t) => ({
    url: `${BASE_URL}/travel/${t.slug}`,
    lastModified: new Date(t.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...storyPages, ...productPages, ...travelPages];
}
