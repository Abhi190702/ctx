import { formatCapsuleAsMarkdown, type PortableCapsule } from "@ctx/core";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function CapsulePreview({ capsule }: { capsule: PortableCapsule }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Markdown Preview</CardTitle>
      </CardHeader>
      <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-ink p-4 text-sm leading-6 text-slate-200">
        {formatCapsuleAsMarkdown(capsule)}
      </pre>
    </Card>
  );
}
