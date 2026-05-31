import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">{children}</main>;
}
