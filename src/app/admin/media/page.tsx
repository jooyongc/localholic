import { createClient } from "@/lib/supabase/server";
import MediaLibraryClient from "./MediaLibraryClient";

interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export const metadata = { title: "미디어 라이브러리" };

export default async function MediaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media")
    .select("id, file_name, file_url, file_type, file_size, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return <MediaLibraryClient initialMedia={(data ?? []) as MediaItem[]} />;
}
