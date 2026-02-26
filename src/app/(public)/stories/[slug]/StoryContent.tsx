"use client";

import { useMemo } from "react";

const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "strong", "em", "b", "i", "u", "s",
  "a", "img", "figure", "figcaption",
  "blockquote", "pre", "code",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "span",
]);

const ALLOWED_ATTR = new Set([
  "href", "target", "rel",
  "src", "alt", "width", "height",
  "class", "id",
]);

function sanitize(html: string): string {
  if (typeof window === "undefined") return html;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("dompurify") as typeof import("dompurify");
  return (DOMPurify as any).sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
  });
}

export default function StoryContent({ html }: { html: string }) {
  const clean = useMemo(() => sanitize(html), [html]);

  return (
    <div
      className="prose prose-lg max-w-none text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-p:leading-relaxed prose-p:text-foreground/80 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-primary/30 prose-blockquote:text-muted"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
