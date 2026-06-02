"use client";

import { ClipboardCopy } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Button type="button" size="sm" variant="secondary" onClick={copy}>
      <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
      {copied ? "Copied" : label}
    </Button>
  );
}
