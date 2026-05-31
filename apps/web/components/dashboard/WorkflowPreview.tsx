import { CTX_WORKFLOW } from "@/lib/constants";

export function WorkflowPreview() {
  return (
    <div className="rounded-lg border border-line bg-ink p-4">
      <h2 className="text-sm font-semibold text-white">Workflow Preview</h2>
      <div className="mt-4 space-y-3">
        {CTX_WORKFLOW.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-mint/30 bg-mint/10 text-sm font-semibold text-mint">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
              {step}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        ChatGPT / Claude / Gemini / Cursor / GitHub -&gt; CTX Capture -&gt; Capsule -&gt; CTX Button -&gt; Inject anywhere.
      </p>
    </div>
  );
}
