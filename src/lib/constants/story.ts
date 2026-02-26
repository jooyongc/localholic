export const STORY_CATEGORIES = [
  "맛집",
  "카페",
  "문화",
  "자연",
  "사람",
  "축제",
] as const;

export const STORY_REGIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충북",
  "충남",
  "대전",
  "세종",
  "전북",
  "전남",
  "광주",
  "경북",
  "경남",
  "대구",
  "울산",
  "부산",
  "제주",
] as const;

export const STORY_STATUS_MAP: Record<
  string,
  { label: string; color: string }
> = {
  draft: { label: "임시저장", color: "bg-gray-100 text-gray-600" },
  published: { label: "발행됨", color: "bg-emerald-100 text-emerald-700" },
  archived: { label: "보관됨", color: "bg-yellow-100 text-yellow-700" },
};
