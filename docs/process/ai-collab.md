# AI Collaboration Playbook

## Sources of Truth
| Layer | Tool | Purpose |
|---|---|---|
| Roadmap & tasks | **GitHub Projects** | Kanban board (“Sprint 0”, etc.) |
| Permanent docs  | `/docs/` repo       | ADRs, specs, notes (via PR) |
| Code            | Pull requests       | Single-PR flow, multi-sig gate |
| Chat            | LLM threads         | Ephemeral; promote within 24 h |

## Baton Block
See `.github/ISSUE_TEMPLATE/baton.md`.

## Context-Refresh Protocol
When any AI reconnects after context loss:  



## Model-Selection (abridged)
| Task | Primary | Escalate |
|------|---------|----------|
| Infra code | ChatGPT-o3 | GPT-4o if needed |
| Long ADRs  | Claude 3   | — |

## Quality Gates
* Unit-test ≥ 80 % lines  
* ESLint + Prettier pass  
* 2 approvals **or** Orchestrator override  
* Docs updated with any user-facing change
