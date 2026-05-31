"use client";

import { Download, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function BackupActions() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  function exportAll() {
    window.open("/api/export", "_blank", "noopener,noreferrer");
  }

  async function importBackup(file: File) {
    setImporting(true);
    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: await file.text()
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Import failed.");
      router.refresh();
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
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
        {importing ? "Importing..." : "Import"}
      </Button>
      <Button type="button" variant="secondary" onClick={exportAll}>
        <Download aria-hidden="true" className="h-4 w-4" />
        Backup
      </Button>
    </div>
  );
}
