import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main id="main-content" className="mx-auto w-full max-w-[100vw] overflow-hidden px-4 py-8 sm:px-6 md:px-10 lg:py-10 xl:max-w-7xl">{children}</main>;
}
