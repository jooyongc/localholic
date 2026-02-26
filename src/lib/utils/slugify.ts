export function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`;
}
