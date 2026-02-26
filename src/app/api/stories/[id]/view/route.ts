import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  await supabase.rpc("increment_view_count", { story_id: id }).maybeSingle();

  return NextResponse.json({ success: true });
}
