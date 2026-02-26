import { createClient } from "@/lib/supabase/server";
import type { Story } from "@/types/database";
import StoryListClient from "./StoryListClient";

export const metadata = { title: "스토리 관리" };

export default async function StoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, title, slug, category, regions, status, view_count, published_at, created_at")
    .order("created_at", { ascending: false });

  return <StoryListClient initialStories={(data ?? []) as Story[]} />;
}
