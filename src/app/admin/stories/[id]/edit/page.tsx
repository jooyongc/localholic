import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Story } from "@/types/database";
import StoryForm from "@/components/admin/stories/StoryForm";

export const metadata = { title: "스토리 편집" };

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <StoryForm initialData={data as Story} />;
}
