"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteCapsuleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setDeleting(true);
    const response = await fetch(`/api/capsules/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/capsules");
      router.refresh();
      return;
    }
    setDeleting(false);
  }

  return (
    <Button type="button" variant="danger" onClick={remove} disabled={deleting}>
      <Trash2 aria-hidden="true" className="h-4 w-4" />
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
