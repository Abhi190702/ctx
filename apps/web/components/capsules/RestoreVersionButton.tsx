"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RestoreVersionButton({ capsuleId, versionId, version }: { capsuleId: string; versionId: string; version: number }) {
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);

  async function restore() {
    if (!window.confirm(`Restore version ${version}? A new version snapshot will be created.`)) return;
    setRestoring(true);
    const response = await fetch(`/api/capsules/${capsuleId}/versions/${versionId}/restore`, { method: "POST" });
    setRestoring(false);
    if (response.ok) router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={restore} disabled={restoring} className="h-8 px-2 text-xs">
      <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
      {restoring ? "Restoring" : "Restore"}
    </Button>
  );
}
