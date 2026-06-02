import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleDot, HelpCircle, ListTodo } from "lucide-react";
import { CopyProjectMemoryButton } from "./CopyProjectMemoryButton";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type ProjectMemory = {
  goals: MemoryItem[];
  decisions: MemoryItem[];
  constraints: MemoryItem[];
  openQuestions: MemoryItem[];
  nextSteps: MemoryItem[];
  tasks: Record<"blocked" | "active" | "planned" | "done", MemoryItem[]>;
  health: {
    staleCapsules: number;
    missingNextSteps: number;
    openQuestionCount: number;
    activeTaskCount: number;
    unresolvedDecisions: number;
    repeatedBugSignals: number;
  };
  memoryPack: string;
  agentBrief: string;
};

type MemoryItem = {
  text: string;
  capsuleId: string;
  capsuleTitle: string;
  updatedAt: Date;
};

export function ProjectMemoryWorkspace({ memory }: { memory: ProjectMemory }) {
  const healthRows = [
    { label: "Open questions", value: memory.health.openQuestionCount, icon: HelpCircle, tone: "text-amber" },
    { label: "Active tasks", value: memory.health.activeTaskCount, icon: ListTodo, tone: "text-mint" },
    { label: "Stale capsules", value: memory.health.staleCapsules, icon: AlertTriangle, tone: "text-rose" },
    { label: "Missing next steps", value: memory.health.missingNextSteps, icon: CircleDot, tone: "text-sky" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {healthRows.map((row) => {
          const Icon = row.icon;
          return (
            <Card key={row.label} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{row.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{row.value}</p>
                </div>
                <Icon aria-hidden="true" className={`h-5 w-5 ${row.tone}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Agent Brief</h2>
              <p className="mt-1 text-sm text-muted-foreground">Prepared context for continuing this project in an AI chat or coding agent.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyProjectMemoryButton text={memory.agentBrief} />
              <CopyProjectMemoryButton text={memory.memoryPack} label="Copy Pack" />
            </div>
          </div>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-ink p-4 text-sm leading-6 text-muted-foreground">
            {memory.agentBrief}
          </pre>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-foreground">Task State</h2>
          <div className="mt-4 space-y-4">
            <TaskGroup title="Blocked" items={memory.tasks.blocked} tone="text-rose" />
            <TaskGroup title="Active" items={memory.tasks.active} tone="text-mint" />
            <TaskGroup title="Planned" items={memory.tasks.planned} tone="text-sky" />
            <TaskGroup title="Done" items={memory.tasks.done} tone="text-muted-foreground" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MemorySection title="Decisions" items={memory.decisions} empty="No durable decisions captured yet." />
        <MemorySection title="Open Questions" items={memory.openQuestions} empty="No open questions captured yet." />
        <MemorySection title="Constraints" items={memory.constraints} empty="No constraints captured yet." />
        <MemorySection title="Next Steps" items={memory.nextSteps} empty="No next steps captured yet." />
      </div>
    </div>
  );
}

function TaskGroup({ title, items, tone }: { title: string; items: MemoryItem[]; tone: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${tone}`}>{title}</p>
        <span className="text-xs text-muted">{items.length}</span>
      </div>
      <div className="mt-2 space-y-2">
        {items.slice(0, 4).map((item) => (
          <MemoryLink key={`${title}-${item.capsuleId}-${item.text}`} item={item} />
        ))}
        {!items.length ? <p className="text-sm text-muted">Nothing here yet.</p> : null}
      </div>
    </div>
  );
}

function MemorySection({ title, items, empty }: { title: string; items: MemoryItem[]; empty: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
          {items.length}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {items.slice(0, 8).map((item) => (
          <MemoryLink key={`${title}-${item.capsuleId}-${item.text}`} item={item} />
        ))}
        {!items.length ? <p className="text-sm leading-6 text-muted-foreground">{empty}</p> : null}
      </div>
    </Card>
  );
}

function MemoryLink({ item }: { item: MemoryItem }) {
  return (
    <Link href={`/capsules/${item.capsuleId}`} className="block rounded-xl border border-line bg-ink p-3 hover:border-mint/40">
      <p className="text-sm leading-6 text-foreground">{item.text}</p>
      <p className="mt-1 text-xs text-muted">{item.capsuleTitle} / {formatDate(item.updatedAt)}</p>
    </Link>
  );
}
