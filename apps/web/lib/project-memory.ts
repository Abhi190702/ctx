import { safeJsonParseArray } from "@ctx/core";

type ProjectCapsule = {
  id: string;
  title: string;
  summary?: string | null;
  rawText?: string | null;
  markdown?: string | null;
  tags?: string | string[] | null;
  goals?: string | null;
  decisions?: string | null;
  constraints?: string | null;
  openQuestions?: string | null;
  nextSteps?: string | null;
  status?: string | null;
  updatedAt: Date;
};

type ProjectInput = {
  name: string;
  description?: string | null;
  repository?: string | null;
  updatedAt: Date;
  capsules: ProjectCapsule[];
};

type MemoryItem = {
  text: string;
  capsuleId: string;
  capsuleTitle: string;
  updatedAt: Date;
};

type ProjectMemory = {
  activeCapsules: ProjectCapsule[];
  goals: MemoryItem[];
  decisions: MemoryItem[];
  constraints: MemoryItem[];
  openQuestions: MemoryItem[];
  nextSteps: MemoryItem[];
  tasks: {
    blocked: MemoryItem[];
    active: MemoryItem[];
    planned: MemoryItem[];
    done: MemoryItem[];
  };
  health: {
    staleCapsules: number;
    missingNextSteps: number;
    openQuestionCount: number;
    activeTaskCount: number;
    unresolvedDecisions: number;
    repeatedBugSignals: number;
  };
  recentCapsules: ProjectCapsule[];
  memoryPack: string;
  agentBrief: string;
};

type MemoryPackInput = Pick<ProjectMemory, "goals" | "decisions" | "constraints" | "openQuestions" | "nextSteps" | "recentCapsules">;
type AgentBriefInput = Pick<ProjectMemory, "goals" | "decisions" | "constraints" | "openQuestions" | "nextSteps" | "recentCapsules" | "health">;

export function buildProjectMemory(project: ProjectInput): ProjectMemory {
  const activeCapsules = project.capsules.filter((capsule) => capsule.status !== "archived");
  const goals = collectItems(activeCapsules, "goals");
  const decisions = collectItems(activeCapsules, "decisions");
  const constraints = collectItems(activeCapsules, "constraints");
  const openQuestions = collectItems(activeCapsules, "openQuestions");
  const nextSteps = collectItems(activeCapsules, "nextSteps");
  const tasks = groupTasks(nextSteps);
  const health = buildProjectHealth(activeCapsules, openQuestions, nextSteps, decisions);
  const recentCapsules = activeCapsules.slice(0, 8);

  return {
    activeCapsules,
    goals,
    decisions,
    constraints,
    openQuestions,
    nextSteps,
    tasks,
    health,
    recentCapsules,
    memoryPack: buildMemoryPack(project, { goals, decisions, constraints, openQuestions, nextSteps, recentCapsules }),
    agentBrief: buildAgentBrief(project, { goals, decisions, constraints, openQuestions, nextSteps, recentCapsules, health })
  };
}

function collectItems(capsules: ProjectCapsule[], key: "goals" | "decisions" | "constraints" | "openQuestions" | "nextSteps"): MemoryItem[] {
  return capsules.flatMap((capsule) =>
    safeJsonParseArray(capsule[key]).map((text) => ({
      text,
      capsuleId: capsule.id,
      capsuleTitle: capsule.title,
      updatedAt: capsule.updatedAt
    }))
  );
}

function buildProjectHealth(capsules: ProjectCapsule[], openQuestions: MemoryItem[], nextSteps: MemoryItem[], decisions: MemoryItem[]) {
  const staleDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const staleCapsules = capsules.filter((capsule) => capsule.updatedAt < staleDate).length;
  const missingNextSteps = capsules.filter((capsule) => safeJsonParseArray(capsule.nextSteps).length === 0).length;
  const unresolvedDecisions = decisions.filter((item) => /unknown|tbd|todo|decide|maybe|\?/i.test(item.text)).length;
  const repeatedBugSignals = capsules.filter((capsule) => {
    const text = [capsule.title, capsule.summary, capsule.rawText, capsule.markdown, tagsText(capsule.tags)].join(" ");
    return /bug|debug|error|failed|failure|exception|regression/i.test(text);
  }).length;

  return {
    staleCapsules,
    missingNextSteps,
    openQuestionCount: openQuestions.length,
    activeTaskCount: nextSteps.length,
    unresolvedDecisions,
    repeatedBugSignals
  };
}

function groupTasks(items: MemoryItem[]) {
  return {
    blocked: items.filter((item) => /blocked|blocker|waiting|cannot|can't|permission|approval/i.test(item.text)),
    active: items.filter((item) => /fix|implement|build|add|verify|review|run|debug|ship|polish/i.test(item.text)),
    planned: items.filter((item) => !/blocked|blocker|waiting|cannot|can't|permission|approval|fix|implement|build|add|verify|review|run|debug|ship|polish|done|complete|merged/i.test(item.text)),
    done: items.filter((item) => /done|complete|completed|merged|shipped|fixed/i.test(item.text))
  };
}

function buildMemoryPack(
  project: ProjectInput,
  memory: MemoryPackInput
) {
  return [
    `# Project Memory: ${project.name}`,
    project.description ? `\n${project.description}` : "",
    project.repository ? `\nRepository: ${project.repository}` : "",
    section("Goals", memory.goals),
    section("Decisions", memory.decisions),
    section("Constraints", memory.constraints),
    section("Open Questions", memory.openQuestions),
    section("Next Steps", memory.nextSteps),
    "\n## Recent Capsules",
    ...memory.recentCapsules.map((capsule) => `- ${capsule.title}: ${capsule.summary || capsule.rawText?.slice(0, 180) || "No summary."}`)
  ]
    .filter(Boolean)
    .join("\n");
}

function buildAgentBrief(
  project: ProjectInput,
  memory: AgentBriefInput
) {
  return [
    `You are continuing work on ${project.name}.`,
    project.repository ? `Repository: ${project.repository}` : "",
    "Use this CTX project memory as the source of truth before taking action.",
    section("Key Decisions", memory.decisions.slice(0, 8)),
    section("Active / Next Work", memory.nextSteps.slice(0, 10)),
    section("Open Questions", memory.openQuestions.slice(0, 8)),
    section("Constraints", memory.constraints.slice(0, 8)),
    `\nHealth: ${memory.health.openQuestionCount} open questions, ${memory.health.missingNextSteps} capsules missing next steps, ${memory.health.staleCapsules} stale capsules.`,
    "\nWhen responding, preserve existing decisions, call out blockers, and update CTX if new durable decisions are made."
  ]
    .filter(Boolean)
    .join("\n");
}

function section(title: string, items: MemoryItem[]) {
  if (!items.length) return "";
  return [`\n## ${title}`, ...items.slice(0, 12).map((item) => `- ${item.text} (${item.capsuleTitle})`)].join("\n");
}

function tagsText(tags: ProjectCapsule["tags"]) {
  if (Array.isArray(tags)) return tags.join(" ");
  return safeJsonParseArray(tags).join(" ");
}
