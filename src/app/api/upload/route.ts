import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function generatePath(originalName: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const timestamp = now.getTime();
  const hash = Math.random().toString(36).substring(2, 10);
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `${year}/${month}/${timestamp}-${hash}.${ext}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json(
      { error: "파일이 없습니다." },
      { status: 400 }
    );
  }

  const results: {
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: 지원하지 않는 파일 형식입니다. (jpg, png, webp, gif만 허용)`);
      continue;
    }

    if (file.size > MAX_SIZE) {
      errors.push(`${file.name}: 파일 크기가 10MB를 초과합니다.`);
      continue;
    }

    const path = generatePath(file.name);
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(path);

    // Save metadata to media table
    await supabase.from("media").insert({
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user.id,
    });

    results.push({
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
    });
  }

  return NextResponse.json({ results, errors });
}
