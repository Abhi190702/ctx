"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProjectForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Project save failed.");
      return;
    }
    router.push(`/projects/${payload.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-line bg-panel p-4 md:grid-cols-[1fr_1fr_auto]">
      <label className="sr-only" htmlFor="project-name">
        Project Name
      </label>
      <Input id="project-name" name="name" required autoComplete="off" placeholder="Project name..." />
      <label className="sr-only" htmlFor="project-repository">
        Repository URL
      </label>
      <Input id="project-repository" name="repository" type="url" autoComplete="off" placeholder="Repository URL..." />
      <Button type="submit">Create Project</Button>
      {error ? <p className="text-sm text-rose md:col-span-3" aria-live="polite">{error}</p> : null}
    </form>
  );
}
