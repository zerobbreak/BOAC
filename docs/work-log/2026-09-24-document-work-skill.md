# Document-work skill

## Exact process

1. Read the Cursor skill-authoring guide at `~/.cursor/skills-cursor/create-skill/SKILL.md` and the agent-writing guide `writing-for-agents` (including `SKILL-MECHANICS.md`) so the new skill used the required frontmatter and model-invocation rules.
2. Chose a personal skill, `document-work`, so it applies after finished work in any project. Omitted `disable-model-invocation` so the agent can ask on its own when a feature, fix, or other unit of work is complete.
3. Wrote `C:\Users\uthac\.cursor\skills\document-work\SKILL.md` with two required outcomes: ask "Should this feature be documented?" and, only after a yes, write `docs/work-log/YYYY-MM-DD-<feature-slug>.md` containing **Exact process** and **Work done**.
4. Asked that question for this skill. The answer was yes.

## Work done

- Personal skill `document-work` exists at `C:\Users\uthac\.cursor\skills\document-work\SKILL.md`.
- After finished work, the agent asks "Should this feature be documented?"
- A yes writes one project file under `docs/work-log/` with the exact process (ordered steps, commands, and decisions) and the work done (names, files, and resulting state).
- A no leaves the project without a new documentation file.
- This record is `docs/work-log/2026-09-24-document-work-skill.md`.
