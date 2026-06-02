"use client";

import { Download, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeamShareActions() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [teamName, setTeamName] = useState("Shared CTX Workspace");
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function exportShareBundle() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/share/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName, passphrase })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Share bundle export failed.");
      const blob = new Blob([JSON.stringify(payload.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ctx-share-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Encrypted share bundle downloaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Share bundle export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function importShareBundle(file: File) {
    setBusy(true);
    setMessage("");
    try {
      const bundle = JSON.parse(await file.text());
      const inspectionResponse = await fetch("/api/share/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundle)
      });
      const inspectionPayload = await inspectionResponse.json();
      if (!inspectionResponse.ok || !inspectionPayload.ok) throw new Error(inspectionPayload.error ?? "Share bundle inspection failed.");
      const inspection = inspectionPayload.data;
      if (!inspection.checksumValid) throw new Error("Share bundle checksum does not match.");
      if (!window.confirm(`Import encrypted bundle for ${inspection.teamName}?`)) return;
      const response = await fetch("/api/share/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle, passphrase })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Share bundle import failed.");
      setMessage(`Imported encrypted bundle for ${inspection.teamName}.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Share bundle import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".json,.ctx.json"
        className="sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void importShareBundle(file);
          event.currentTarget.value = "";
        }}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input value={teamName} onChange={(event) => setTeamName(event.currentTarget.value)} placeholder="Team or workspace name" />
        <Input
          value={passphrase}
          onChange={(event) => setPassphrase(event.currentTarget.value)}
          type="password"
          placeholder="Passphrase, 8+ characters"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={busy || passphrase.length < 8} onClick={exportShareBundle}>
          <Download aria-hidden="true" className="h-4 w-4" />
          Export Share Bundle
        </Button>
        <Button type="button" variant="secondary" disabled={busy || passphrase.length < 8} onClick={() => inputRef.current?.click()}>
          <Upload aria-hidden="true" className="h-4 w-4" />
          Import Share Bundle
        </Button>
      </div>
      {message ? <p className="text-xs text-muted-foreground" aria-live="polite">{message}</p> : null}
    </div>
  );
}
