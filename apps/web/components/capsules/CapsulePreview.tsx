import { formatCapsuleAsMarkdown, type PortableCapsule } from "@ctx/core";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function CapsulePreview({ capsule }: { capsule: PortableCapsule }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Markdown Preview</CardTitle>
      </CardHeader>
      <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-ink p-4 text-sm leading-6 text-foreground">
        {formatCapsuleAsMarkdown(capsule)}
      </pre>
    </Card>
  );
}
