import { formatCapsuleForInjection, type PortableCapsule } from "@ctx/core";

export function CapsuleFormatPreview({ capsule }: { capsule: PortableCapsule }) {
  return (
    <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-ink p-4 text-sm leading-6 text-mint">
      {formatCapsuleForInjection(capsule)}
    </pre>
  );
}
