import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <div className="rounded-lg border border-line bg-panel p-10 text-center">
        <h1 className="text-2xl font-semibold text-white">Page Not Found</h1>
        <p className="mt-2 text-sm text-slate-400">This CTX surface does not exist yet.</p>
        <Link href="/" className="mt-6 inline-flex">
          <Button type="button">Return Home</Button>
        </Link>
      </div>
    </PageShell>
  );
}
