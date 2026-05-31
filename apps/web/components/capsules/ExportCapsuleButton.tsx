"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportCapsuleButton({ id }: { id: string }) {
  function openExport() {
    window.open(`/api/export?id=${encodeURIComponent(id)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <Button type="button" variant="secondary" onClick={openExport}>
      <Download aria-hidden="true" className="h-4 w-4" />
      Export JSON
    </Button>
  );
}
