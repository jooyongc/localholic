import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();
  const { name, category, region, price, description, images } = body;

  if (!name) {
    return NextResponse.json({ error: "상품명은 필수입니다." }, { status: 400 });
  }

  const prompt = `당신은 지역 특산품 전문 상세페이지 디자이너입니다.
다음 상품 정보를 바탕으로 통일된 디자인의 상품 상세페이지 HTML을 생성해주세요.

[디자인 가이드라인]
- Tailwind CSS 클래스만 사용 (외부 CSS 없이)
- 상단: 상품 이미지 갤러리 (메인 이미지 + 썸네일 리스트)는 별도 컴포넌트로 처리하므로 제외
- 상품 핵심 정보 요약 박스 (산지, 중량/수량, 보관방법 등을 아이콘과 함께) — SVG 아이콘 인라인 사용
- 스토리텔링 섹션 (이 상품의 특별한 점, 생산자 이야기 느낌으로)
- 상품 상세 설명 (깔끔한 레이아웃)
- "이런 분께 추천해요" 섹션
- 배송/교환/반품 안내 섹션 (아코디언 형태, details/summary 태그 사용)
- 전체적으로 따뜻하고 신뢰감 있는 디자인 톤
- 색상: emerald 계열 primary (#2d5a3d), 배경 #faf8f5

[상품 정보]
- 상품명: ${name}
- 카테고리: ${category || "미지정"}
- 지역: ${region || "미지정"}
- 가격: ${price ? price.toLocaleString() + "원" : "미정"}
- 설명: ${description || "없음"}
- 이미지 URL 목록: ${images?.length ? images.join(", ") : "없음"}

[출력 형식]
다음 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요:
{
  "html": "상세페이지 HTML 문자열",
  "meta_title": "SEO용 제목 (60자 이내)",
  "meta_description": "SEO용 설명 (160자 이내)"
}`;

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const response = await stream.finalMessage();

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "AI 응답을 생성하지 못했습니다." },
        { status: 500 }
      );
    }

    const raw = textBlock.text.trim();
    // Extract JSON from possible markdown code blocks
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 응답 파싱 실패", raw },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      html: parsed.html,
      meta_title: parsed.meta_title,
      meta_description: parsed.meta_description,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: "AI 생성 실패: " + message },
      { status: 500 }
    );
  }
}
