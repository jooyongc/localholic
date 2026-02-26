"use client";

import { useEffect } from "react";

export default function ViewCounter({ storyId }: { storyId: string }) {
  useEffect(() => {
    fetch(`/api/stories/${storyId}/view`, { method: "POST" }).catch(
      () => {}
    );
  }, [storyId]);

  return null;
}
