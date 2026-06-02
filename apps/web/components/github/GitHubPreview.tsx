import { Card } from "@/components/ui/card";

export function GitHubPreview() {
  const rows = [
    ["Issue", "Title, body, state, labels, author, URL, and issue comments"],
    ["Pull Request", "Title, body, base/head branches, merge state, reviews, inline threads, commits, and CI checks"],
    ["README", "Decoded markdown documentation"],
    ["Repository", "Description, language, stars, topics, license, and recent releases"]
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground">Capture Preview</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Structured Memory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(([type, detail]) => (
              <tr key={type}>
                <td className="px-3 py-2 text-foreground">{type}</td>
                <td className="px-3 py-2 text-muted-foreground">{detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
