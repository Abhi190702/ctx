"use client";

import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CapsuleRow = {
  id: string;
  title: string;
  status?: string | null;
  project?: { name?: string | null } | null;
};

export function CapsuleBulkActions({ capsules }: { capsules: CapsuleRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState("");
  const visibleCapsules = capsules.slice(0, 30);

  async function run(action: "archive" | "restore" | "delete") {
    if (!selected.length) return;
    if (action === "delete" && !window.confirm(`Permanently delete ${selected.length} selected capsules?`)) return;
    setBusy(action);
    const response = await fetch("/api/capsules/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, action })
    });
    setBusy("");
    if (response.ok) {
      setSelected([]);
      router.refresh();
    }
  }

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  if (!capsules.length) return null;

  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Bulk Cleanup</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select visible capsules, then archive, restore, or delete them together.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void run("archive")} disabled={!selected.length || Boolean(busy)}>
            <Archive aria-hidden="true" className="h-4 w-4" />
            {busy === "archive" ? "Archiving..." : "Archive"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void run("restore")} disabled={!selected.length || Boolean(busy)}>
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            {busy === "restore" ? "Restoring..." : "Restore"}
          </Button>
          <Button type="button" variant="danger" onClick={() => void run("delete")} disabled={!selected.length || Boolean(busy)}>
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            {busy === "delete" ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
      <div className="mt-4 max-h-80 overflow-auto rounded-xl border border-line">
        {visibleCapsules.map((capsule) => (
          <label key={capsule.id} className="flex cursor-pointer items-center gap-3 border-b border-line px-3 py-2 last:border-b-0 hover:bg-ink">
            <input
              type="checkbox"
              checked={selected.includes(capsule.id)}
              onChange={() => toggle(capsule.id)}
              className="h-4 w-4 accent-mint"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{capsule.title}</span>
              <span className="text-xs text-muted">{capsule.project?.name || "No project"} / {capsule.status || "active"}</span>
            </span>
          </label>
        ))}
      </div>
      {capsules.length > visibleCapsules.length ? (
        <p className="mt-3 text-xs text-muted">Showing first {visibleCapsules.length} filtered capsules. Narrow the search to clean up a smaller set.</p>
      ) : null}
    </Card>
  );
}
