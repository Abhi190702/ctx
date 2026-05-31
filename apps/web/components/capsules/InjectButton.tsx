"use client";

import { Clipboard, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InjectButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button type="button" onClick={copy} aria-live="polite">
      {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Clipboard aria-hidden="true" className="h-4 w-4" />}
      {copied ? "Copied" : "Copy Injection Prompt"}
    </Button>
  );
}
