"use client";

import { useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function GitHubCaptureCard({ tokenConfigured }: { tokenConfigured: boolean }) {
  const [type, setType] = useState("issue");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    if (body.number === "") delete body.number;

    try {
      const response = await fetch("/api/github/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "GitHub capture failed.");
      setMessage(`Created capsule: ${payload.data.capsule.title}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "GitHub capture failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Create Capsule from GitHub</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Turn GitHub issues, pull requests, READMEs, comments, reviews, CI checks, and repository metadata into reusable AI memory.
          </p>
        </div>
        <span className={tokenConfigured ? "text-mint" : "text-amber"}>
          {tokenConfigured ? "Token Ready" : "Token Missing"}
        </span>
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Owner" name="owner" placeholder="openai..." />
          <Field label="Repository" name="repo" placeholder="ctx..." />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="github-type" className="mb-2 block text-sm font-medium text-slate-200">
              Capture Type
            </label>
            <select
              id="github-type"
              name="type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-ink px-3 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
            >
              <option value="issue">Issue</option>
              <option value="pull_request">Pull Request</option>
              <option value="readme">README</option>
              <option value="repository">Repository Summary</option>
            </select>
          </div>
          {(type === "issue" || type === "pull_request") && (
            <Field label="Issue / PR Number" name="number" type="number" min="1" placeholder="123..." />
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Github aria-hidden="true" className="h-4 w-4" />}
          {loading ? "Capturing..." : "Create Capsule from GitHub"}
        </Button>
        {message ? <p className="text-sm text-slate-300" aria-live="polite">{message}</p> : null}
      </form>
    </Card>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={`github-${name}`} className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <Input id={`github-${name}`} name={name} required autoComplete="off" {...props} />
    </div>
  );
}
