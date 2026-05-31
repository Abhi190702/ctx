"use client";

import { ClipboardPaste, FileUp, Save, Settings2, Sparkles, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CapsuleForm } from "./CapsuleForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DraftCapsule = {
  title: string;
  summary?: string | null;
  rawText?: string | null;
  markdown?: string | null;
  projectName?: string | null;
  platform?: string | null;
  sourceUrl?: string | null;
  tags?: string[] | string;
  goals?: string[] | string;
  decisions?: string[] | string;
  constraints?: string[] | string;
  openQuestions?: string[] | string;
  nextSteps?: string[] | string;
  importance?: number;
};

export function QuickCapsuleCreator() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [tags, setTags] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [draft, setDraft] = useState<DraftCapsule | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function generateDraft() {
    setBusy(true);
    setMessage("");
    try {
      const payload = await postJson("/api/capsules/draft", { text, title, projectName, tags, sourceUrl });
      setDraft(payload.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not prepare capsule.");
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    setBusy(true);
    setMessage("");
    try {
      const payload = await postJson("/api/capsules", draft);
      router.push(`/capsules/${payload.data.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save capsule.");
    } finally {
      setBusy(false);
    }
  }

  async function generateAndSave() {
    setBusy(true);
    setMessage("");
    try {
      const payload = await postJson("/api/capsules/quick", { text, title, projectName, tags, sourceUrl });
      router.push(`/capsules/${payload.data.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not generate capsule.");
    } finally {
      setBusy(false);
    }
  }

  async function pasteClipboard() {
    try {
      const pasted = await navigator.clipboard.readText();
      setText(pasted);
      setDraft(null);
    } catch {
      setMessage("Clipboard permission was blocked by the browser.");
    }
  }

  async function importFile(file: File) {
    const fileText = await file.text();
    if (file.name.endsWith(".json")) {
      try {
        const payload = await postJson("/api/import", JSON.parse(fileText));
        const first = Array.isArray(payload.data) ? payload.data[0] : payload.data;
        if (first?.id) {
          router.push(`/capsules/${first.id}`);
          router.refresh();
          return;
        }
      } catch {
        // Fall through and treat unknown JSON as raw context.
      }
    }
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    setText(fileText);
    setDraft(null);
  }

  function updateDraft<K extends keyof DraftCapsule>(key: K, value: DraftCapsule[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-6">
        <section className="rounded-lg border border-mint/30 bg-mint/[0.04] p-5 shadow-glow">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Fast Capsule</h2>
              <p className="mt-1 text-sm text-slate-400">Paste once. CTX prepares the memory.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={pasteClipboard}>
                <ClipboardPaste aria-hidden="true" className="h-4 w-4" />
                Paste
              </Button>
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <FileUp aria-hidden="true" className="h-4 w-4" />
                Import
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
            onChange={(event) => {
              setText(event.target.value);
              setDraft(null);
            }}
            rows={12}
            placeholder="Paste a chat, PR, error log, meeting notes, research notes, or project context..."
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
            <Button type="button" onClick={generateDraft} disabled={busy || !text.trim()}>
              <Wand2 aria-hidden="true" className="h-4 w-4" />
              {busy ? "Working..." : "Preview Capsule"}
            </Button>
            <Button type="button" variant="secondary" onClick={generateAndSave} disabled={busy || !text.trim()}>
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Quick Save
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

      <aside className="rounded-lg border border-line bg-panel p-5 shadow-glow">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Capture Review</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Review the generated memory before saving it.</p>
        </div>
        {draft ? (
          <div className="space-y-4">
            <LabeledInput label="Title" value={draft.title} onChange={(value) => updateDraft("title", value)} />
            <LabeledInput label="Project" value={draft.projectName ?? ""} onChange={(value) => updateDraft("projectName", value)} />
            <LabeledInput label="Tags" value={arrayText(draft.tags)} onChange={(value) => updateDraft("tags", value)} />
            <LabeledTextarea label="Summary" value={draft.summary ?? ""} onChange={(value) => updateDraft("summary", value)} rows={5} />
            <LabeledTextarea label="Next Steps" value={arrayText(draft.nextSteps)} onChange={(value) => updateDraft("nextSteps", value)} rows={4} />
            <QualityChecklist draft={draft} />
            <Button type="button" onClick={saveDraft} disabled={busy}>
              <Save aria-hidden="true" className="h-4 w-4" />
              {busy ? "Saving..." : "Save Reviewed Capsule"}
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-white/[0.03] p-5 text-sm leading-6 text-slate-400">
            Generate a preview to inspect the capsule before it becomes memory.
          </div>
        )}
      </aside>
    </div>
  );
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Request failed.");
  return payload;
}

function arrayText(value: string[] | string | null | undefined) {
  return Array.isArray(value) ? value.join("\n") : value ?? "";
}

function QualityChecklist({ draft }: { draft: DraftCapsule }) {
  const checks = [
    { label: "Summary", ok: Boolean(draft.summary?.trim()) },
    { label: "Tags", ok: arrayText(draft.tags).trim().length > 0 },
    { label: "Next steps", ok: arrayText(draft.nextSteps).trim().length > 0 },
    { label: "Source", ok: Boolean(draft.sourceUrl?.trim()) }
  ];
  const score = Math.round((checks.filter((check) => check.ok).length / checks.length) * 100);

  return (
    <div className="rounded-lg border border-line bg-white/[0.03] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">Capsule Quality</span>
        <span className="text-sm font-semibold text-mint">{score}%</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <span key={check.label} className={check.ok ? "text-xs font-medium text-mint" : "text-xs font-medium text-slate-500"}>
            {check.ok ? "Ready" : "Needs"}: {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  rows
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} />
    </label>
  );
}
