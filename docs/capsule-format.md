# Capsule Format

CTX uses portable `.ctx.json` capsules.

```json
{
  "schemaVersion": "0.1.0",
  "id": "ctx_abc123",
  "title": "Kubernetes Auto-Healing Dashboard",
  "description": "Project memory capsule",
  "source": {
    "type": "conversation",
    "platform": "chatgpt",
    "url": "https://chatgpt.com/...",
    "capturedAt": "2026-05-31T10:00:00.000Z"
  },
  "project": {
    "name": "KubeHeal",
    "repository": "https://github.com/example/kubeheal"
  },
  "summary": "The user is building a Kubernetes dashboard with monitoring and AI remediation.",
  "goals": [],
  "decisions": [],
  "constraints": [],
  "openQuestions": [],
  "nextSteps": [],
  "tags": [],
  "content": {
    "rawText": "",
    "markdown": ""
  },
  "metadata": {
    "createdAt": "",
    "updatedAt": "",
    "version": 1,
    "tokenEstimate": 0,
    "importance": 0
  }
}
```

The injection formatter turns a capsule into an AI-ready prompt with summary, goals, decisions, constraints, questions, next steps, and raw context.
