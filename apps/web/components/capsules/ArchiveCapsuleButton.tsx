"use client";

import { Archive, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ArchiveCapsuleButton({ id, archived = false }: { id: string; archived?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleArchive() {
    setBusy(true);
    const response = await fetch(`/api/capsules/${id}/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !archived })
    });
    setBusy(false);
    if (response.ok) router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={toggleArchive} disabled={busy}>
      {archived ? <RotateCcw aria-hidden="true" className="h-4 w-4" /> : <Archive aria-hidden="true" className="h-4 w-4" />}
      {busy ? "Saving..." : archived ? "Restore" : "Archive"}
    </Button>
  );
}
