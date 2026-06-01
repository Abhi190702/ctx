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
      <h2 className="text-lg font-semibold text-white">Capture Preview</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Structured Memory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(([type, detail]) => (
              <tr key={type}>
                <td className="px-3 py-2 text-white">{type}</td>
                <td className="px-3 py-2 text-slate-400">{detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
