import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <div className="rounded-xl border border-line bg-panel p-10 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Page Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This CTX surface does not exist yet.</p>
        <Link href="/" className="mt-6 inline-flex">
          <Button type="button">Return Home</Button>
        </Link>
      </div>
    </PageShell>
  );
}
