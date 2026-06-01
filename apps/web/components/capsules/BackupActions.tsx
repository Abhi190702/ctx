"use client";

import { Download, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function BackupActions() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  function exportAll() {
    window.open("/api/export", "_blank", "noopener,noreferrer");
  }

  async function importBackup(file: File) {
    setImporting(true);
    setMessage("");
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const inspectionResponse = await fetch("/api/backup/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const inspectionPayload = await inspectionResponse.json();
      if (!inspectionResponse.ok || !inspectionPayload.ok) throw new Error(inspectionPayload.error ?? "Backup inspection failed.");
      const inspection = inspectionPayload.data;
      if (inspection.checksumValid === false) throw new Error("Backup checksum does not match. Export a fresh backup before restoring.");
      if (!window.confirm(`Restore ${inspection.capsuleCount} capsule${inspection.capsuleCount === 1 ? "" : "s"} from this backup?`)) return;
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Import failed.");
      setMessage(`Restored ${inspection.capsuleCount} capsule${inspection.capsuleCount === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Backup restore failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".json,.ctx.json"
        className="sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void importBackup(file);
          event.currentTarget.value = "";
        }}
      />
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={importing}>
        <Upload aria-hidden="true" className="h-4 w-4" />
        {importing ? "Restoring..." : "Restore Backup"}
      </Button>
      <Button type="button" variant="secondary" onClick={exportAll}>
        <Download aria-hidden="true" className="h-4 w-4" />
        Download Backup
      </Button>
      {message ? <span className="text-xs text-slate-400" aria-live="polite">{message}</span> : null}
    </div>
  );
}
