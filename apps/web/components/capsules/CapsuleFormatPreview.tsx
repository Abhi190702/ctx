import { formatCapsuleForInjection, type PortableCapsule } from "@ctx/core";

export function CapsuleFormatPreview({ capsule }: { capsule: PortableCapsule }) {
  return (
    <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-ink p-4 text-sm leading-6 text-foreground">
      {formatCapsuleForInjection(capsule)}
    </pre>
  );
}
