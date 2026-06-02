const defaultApiUrl = "http://localhost:3000/api";

export class CtxClient {
  apiUrl: string;

  constructor(apiUrl = process.env.CTX_API_URL || defaultApiUrl) {
    this.apiUrl = apiUrl.replace(/\/$/, "");
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {})
        }
      });
    } catch {
      throw new Error(
        `CTX API is unavailable at ${this.apiUrl}. Start the web app with pnpm web:dev before using the MCP server.`,
      );
    }

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; data?: T; error?: string }
      | null;
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error ?? `CTX API request failed with status ${response.status}.`);
    }
    return payload.data as T;
  }

  health() {
    return this.request("/health");
  }

  searchCapsules(query: string) {
    return this.request<any[]>(`/search?q=${encodeURIComponent(query)}`);
  }

  getCapsule(id: string) {
    return this.request(`/capsules/${encodeURIComponent(id)}`);
  }

  createCapsule(input: unknown) {
    return this.request("/capsules", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  updateCapsule(id: string, fields: unknown) {
    return this.request(`/capsules/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(fields)
    });
  }

  listRecentCapsules(limit = 10) {
    return this.request<any[]>("/capsules").then((capsules) => capsules.slice(0, limit));
  }

  listProjects() {
    return this.request<any[]>("/projects");
  }

  exportCapsule(id: string) {
    return this.request(`/export?id=${encodeURIComponent(id)}`);
  }

  createCapsuleFromGitHub(input: unknown) {
    return this.request("/github/capture", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  async getProjectMemory(input: { projectId?: string; projectName?: string }) {
    const projects = await this.request<any[]>("/projects");
    const project = input.projectId
      ? projects.find((item) => item.id === input.projectId)
      : projects.find((item) => item.name.toLowerCase() === input.projectName?.toLowerCase());
    if (!project) throw new Error("Project not found.");
    return this.request(`/projects/${encodeURIComponent(project.id)}`);
  }

  async getAgentBrief(input: { projectId?: string; projectName?: string; task?: string }) {
    const projectMemory = await this.getProjectMemory(input);
    const query = [input.task, input.projectName].filter(Boolean).join(" ");
    const relatedCapsules = query ? await this.searchCapsules(query).then((items) => items.slice(0, 8)) : await this.listRecentCapsules(8);

    return {
      generatedAt: new Date().toISOString(),
      task: input.task ?? null,
      projectMemory,
      relatedCapsules,
      agentInstructions: [
        "Use the project memory as durable context.",
        "Prefer explicit decisions and constraints over assumptions.",
        "Call CTX search again when the task mentions a subsystem, issue, PR, or platform not covered in this brief.",
        "Do not overwrite capsule memory unless the user asks you to update CTX."
      ]
    };
  }

  async validateSetup() {
    const [health, recentCapsules, projects] = await Promise.all([
      this.health(),
      this.listRecentCapsules(3),
      this.listProjects()
    ]);

    return {
      apiUrl: this.apiUrl,
      health,
      recentCapsules,
      projectCount: projects.length,
      ready: true
    };
  }
}
