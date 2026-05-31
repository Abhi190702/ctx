import Link from "next/link";
import { Button } from "./button";

export function EmptyState({
  title,
  description,
  href,
  action
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/[0.03] p-8 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
      {href && action ? (
        <Link href={href} className="mt-5 inline-flex">
          <Button type="button">{action}</Button>
        </Link>
      ) : null}
    </div>
  );
}
