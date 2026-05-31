import { safeJsonParseArray } from "@ctx/core";
import { Badge } from "@/components/ui/badge";

export function CapsuleTags({ tags }: { tags?: string | null }) {
  const parsed = safeJsonParseArray(tags);
  if (!parsed.length) return <Badge>No Tags</Badge>;
  return (
    <div className="flex flex-wrap gap-2">
      {parsed.map((tag) => (
        <Badge key={tag}>#{tag}</Badge>
      ))}
    </div>
  );
}
