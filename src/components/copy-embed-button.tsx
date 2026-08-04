"use client";

import { Button } from "@/components/ui/button";

export function CopyEmbedButton({ text }: { text: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="absolute right-3 top-3"
      onClick={() => navigator.clipboard.writeText(text)}
    >
      Copy
    </Button>
  );
}
