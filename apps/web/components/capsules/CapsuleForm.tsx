"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CapsuleForm({ capsule }: { capsule?: any }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const response = await fetch(capsule ? `/api/capsules/${capsule.id}` : "/api/capsules", {
        method: capsule ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Save failed.");
      router.push(`/capsules/${payload.data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" aria-describedby={error ? "capsule-form-error" : undefined}>
      {error ? (
        <p id="capsule-form-error" className="rounded-xl border border-rose/40 bg-rose/10 p-3 text-sm text-rose" aria-live="polite">
          {error}
        </p>
      ) : null}
      <FormSection title="Basics" description="Name this memory so it can be found and reused later.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" name="title" required defaultValue={capsule?.title} />
          <Field label="Project Name" name="projectName" defaultValue={capsule?.project?.name} placeholder="ctx, portfolio, research..." />
          <Field label="Tags" name="tags" defaultValue={capsule?.tags} placeholder="github, api, release..." />
          <Field label="Importance" name="importance" type="number" min="0" max="10" defaultValue={capsule?.importance ?? 0} />
        </div>
        <TextField label="Description" name="description" defaultValue={capsule?.description} rows={3} />
        <TextField label="Summary" name="summary" defaultValue={capsule?.summary} rows={4} />
      </FormSection>

      <FormSection title="Source" description="Keep the original surface attached for auditability.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Platform" name="platform" defaultValue={capsule?.platform} placeholder="chatgpt, github, cursor..." />
          <Field label="Source URL" name="sourceUrl" type="url" defaultValue={capsule?.sourceUrl} placeholder="https://..." />
        </div>
      </FormSection>

      <FormSection title="Structured Memory" description="Capture the durable pieces an AI tool should preserve.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Goals" name="goals" defaultValue={capsule?.goals} />
          <TextField label="Decisions" name="decisions" defaultValue={capsule?.decisions} />
          <TextField label="Constraints" name="constraints" defaultValue={capsule?.constraints} />
          <TextField label="Open Questions" name="openQuestions" defaultValue={capsule?.openQuestions} />
        </div>
        <TextField label="Next Steps" name="nextSteps" defaultValue={capsule?.nextSteps} />
      </FormSection>

      <FormSection title="Raw Context" description="Optional source notes that make the capsule richer.">
        <TextField label="Raw Context" name="rawText" defaultValue={capsule?.rawText} rows={8} />
        <TextField label="Markdown Notes" name="markdown" defaultValue={capsule?.markdown} rows={8} />
      </FormSection>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving}>
          <Save aria-hidden="true" className="h-4 w-4" />
          {saving ? "Saving..." : capsule ? "Save Capsule" : "Create Capsule"}
        </Button>
        {capsule ? (
          <Link href={`/capsules/${capsule.id}`}>
            <Button type="button" variant="secondary">
              <Eye aria-hidden="true" className="h-4 w-4" />
              Preview Injection
            </Button>
          </Link>
        ) : null}
        <Link href={capsule ? `/capsules/${capsule.id}` : "/capsules"}>
          <Button type="button" variant="ghost">Cancel</Button>
        </Link>
      </div>
    </form>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <Input id={name} name={name} autoComplete="off" placeholder={props.placeholder ?? `${label}...`} {...props} />
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  rows = 4
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <Textarea id={name} name={name} rows={rows} defaultValue={defaultValue ?? ""} placeholder={`${label}...`} autoComplete="off" />
    </div>
  );
}
