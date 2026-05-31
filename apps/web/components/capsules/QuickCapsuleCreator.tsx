"use client";

import { ClipboardPaste, FileUp, Settings2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CapsuleForm } from "./CapsuleForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function QuickCapsuleCreator() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [tags, setTags] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function generate() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/capsules/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title, projectName, tags, sourceUrl })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Could not generate capsule.");
      router.push(`/capsules/${payload.data.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not generate capsule.");
    } finally {
      setSaving(false);
    }
  }

  async function pasteClipboard() {
    try {
      setText(await navigator.clipboard.readText());
    } catch {
      setMessage("Clipboard permission was blocked by the browser.");
    }
  }

  async function importFile(file: File) {
    const fileText = await file.text();
    if (file.name.endsWith(".json")) {
      try {
        const response = await fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: fileText
        });
        const payload = await response.json();
        if (response.ok && payload.ok) {
          const first = Array.isArray(payload.data) ? payload.data[0] : payload.data;
          if (first?.id) {
            router.push(`/capsules/${first.id}`);
            router.refresh();
            return;
          }
        }
      } catch {
        // Fall through and treat unknown JSON as raw notes.
      }
    }
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    setText(fileText);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-mint/30 bg-mint/[0.04] p-5 shadow-glow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Fast Capsule</h2>
            <p className="mt-1 text-sm text-slate-400">Paste once. CTX fills the structure.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={pasteClipboard}>
              <ClipboardPaste aria-hidden="true" className="h-4 w-4" />
              Paste
            </Button>
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <FileUp aria-hidden="true" className="h-4 w-4" />
              Import File
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.json,.ctx.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importFile(file);
            event.currentTarget.value = "";
          }}
        />

        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={12}
          placeholder="Paste a chat, PR, error log, meeting notes, research notes, or any useful project context..."
          className="min-h-[260px]"
        />

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title optional" />
          <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project optional" />
          <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags optional" />
          <Input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Source URL optional" />
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-rose/40 bg-rose/10 p-3 text-sm text-rose" aria-live="polite">
            {message}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={generate} disabled={saving || !text.trim()}>
            <Wand2 aria-hidden="true" className="h-4 w-4" />
            {saving ? "Generating..." : "Generate Capsule"}
          </Button>
          <span className="text-xs text-slate-500">{text.trim() ? `${text.trim().length.toLocaleString()} characters ready` : "Waiting for context"}</span>
        </div>
      </section>

      <details className="rounded-lg border border-line bg-panel p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-slate-200">
          <Settings2 aria-hidden="true" className="h-4 w-4" />
          Advanced manual editor
        </summary>
        <div className="mt-5 border-t border-line pt-5">
          <CapsuleForm />
        </div>
      </details>
    </div>
  );
}
