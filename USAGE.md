# gstack — Quick Usage Guide

This short guide explains how to get started with gstack, authenticate providers (Claude, Codex, Gemini), run the most common commands, and where to look for deeper docs.

## Overview

gstack is a workflow and skillpack for AI-assisted software development. It integrates with multiple AI coding hosts (Claude Code, OpenAI Codex CLI, Gemini CLI, Cursor, Opencode, etc.) and provides slash-command skills for planning, reviewing, QA, security, and shipping.

## Requirements

- Bun v1.0+ (primary runtime)
- Git
- Node.js (Windows only for some browse fallback paths)

## Quick start (30s)

1. Clone and run the bundled setup (installs into your primary host, e.g. Claude Code):

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

2. Inside the repo (developer mode) install deps and build:

```bash
bun install
bun run build
```

3. Run tests:

```bash
bun test
```

## Team mode (recommended)

To make gstack required for a repo (so teammates auto-get it):

```bash
(cd ~/.claude/skills/gstack && ./setup --team) \
  && ~/.claude/skills/gstack/bin/gstack-team-init required \
  && git add .claude/ CLAUDE.md && git commit -m "require gstack for AI-assisted work"
```

Replace `required` with `optional` to nudge rather than require.

## Authentication (providers)

- Claude Code: run `claude login` or follow the host client's auth flow. Credentials typically live in `~/.claude/.credentials.json`.
- Codex / OpenAI CLI: run `codex login` or set `CODEX_API_KEY` / `OPENAI_API_KEY`.
- Gemini CLI: run `gemini login` or export `GOOGLE_API_KEY` as needed.
- Other hosts (Cursor, Opencode, Slate, Factory) may require host-specific auth or env vars — check their host docs in `hosts/*.ts`.

If a skill detects no auth for a provider it will skip that provider and show a one-line suggestion (e.g., "run `codex login`").

## Common commands

- Install deps: `bun install`
- Build CLI/binaries: `bun run build`
- Run unit + skill tests: `bun test`
- Generate skill docs (used by build): `bun run gen:skill-docs`
- Run the browse dev server: `bun run browse/src/server.ts` or `bun run dev`

Standalone binaries shipped in the repo (built by `bun run build`):

- `bin/gstack-global-discover` — discover local AI coding sessions (Claude/Codex/Gemini).
- `gstack-model-benchmark` — run cross-model benchmark (Claude / Codex/GPT / Gemini). Use `--dry-run` to validate auth without spending calls.

Example benchmark dry-run:

```bash
gstack-model-benchmark --prompt "unused, dry-run" --models claude,gpt,gemini --dry-run
```

## Running skills

gstack skills are typically invoked from inside an AI host session (e.g., Claude Code) using slash commands like `/office-hours`, `/plan-eng-review`, `/review`, `/qa`, `/ship`, `/codex`, etc. See the top-level `SKILL.md` for an auto-generated summary of the `gstack` root skill.

For local CLI-style workflows, use the `bin/` CLIs or `bun run` scripts in `package.json`.

## Troubleshooting

- Skill not showing up: `cd ~/.claude/skills/gstack && ./setup`
- `gstack-model-benchmark` missing: run `bun run build` to compile binaries
- `/browse` or Playwright issues on Windows: use Git Bash or WSL; ensure `node` is on PATH in addition to `bun`.
- Codex auth errors: run `codex login` or set `CODEX_API_KEY`.

## Where to learn more

- Full docs and deep dives: `docs/skills.md`, `BROWSER.md`, `ARCHITECTURE.md`, `CLAUDE.md`, `CONTRIBUTING.md`.
- Changelog: `CHANGELOG.md`

If you'd like, I can expand this guide with step-by-step Windows instructions, screenshots, or a short example walkthrough (e.g., run `/office-hours` → `/autoplan` → `/ship`). Tell me which example you want.

## Example walkthrough: `/office-hours` → `/autoplan` → `/ship`

This quick example shows a common flow from idea → reviewed plan → ship. These are slash commands run inside a host session (e.g., Claude Code).

1) Capture the idea with `/office-hours`

```text
You: /office-hours
Claude: Asks six forcing questions, pushes back on assumptions, and writes a short design doc (saved as DESIGN.md). It extracts the narrowest MVP and lists key success metrics.
```

2) Run the automated review pipeline with `/autoplan` to produce an implementation plan

```text
You: /autoplan DESIGN.md     # or just `/autoplan` and follow prompts
Claude: Runs CEO → design → eng → DX reviews, summarizes decisions, and outputs a reviewed plan with ordered tasks, estimated effort, and files to change.
```

3) Approve the plan and ship with `/ship`

```text
You: /ship --approve         # confirms plan and asks gstack to implement and open a PR
gstack: Runs tests, applies changes or generates patches, bumps VERSION/CHANGELOG as appropriate, and opens a PR with the implementation + tests.
```

Notes:
- Review the generated design doc and plan before approving `/ship` — `/autoplan` surfaces taste decisions for manual confirmation.
- If you prefer to implement locally, use the plan as a checklist and run `/review` and `/qa` on your branch before `/ship`.

