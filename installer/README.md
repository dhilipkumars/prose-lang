# Installer

Installs the prose-lang specification and AI agent skills per-project or globally.

## Install System-Wide (via `uv`)

```bash
# From the repo root
uv tool install .

# Now available anywhere:
prose-install --scope local --agent gemini
```

To upgrade after pulling new changes:

```bash
uv tool install . --force
```

## Run Directly (no install needed)

```bash
python3 installer/cli.py --scope local --agent gemini
```

## Options

| Flag      | Values                                              | Description                          |
|-----------|-----------------------------------------------------|--------------------------------------|
| `--scope` | `local`, `global`                                   | `local` = CWD, `global` = home dir  |
| `--agent` | `antigravity`, `claude`, `codex`, `copilot`, `gemini` | AI agent to install skills for       |

## What Gets Installed

1. **Specification** → `$TARGET/.prose/specification.md`
2. **Agent Skills** → agent-specific path:

| Agent         | Skill Path                                          |
|---------------|-----------------------------------------------------|
| `gemini`      | `$TARGET/.gemini/skills/prose-lang/SKILL.md`        |
| `claude`      | `$TARGET/.claude/skills/prose-lang/SKILL.md`        |
| `copilot`     | `$TARGET/.github/instructions/prose-lang/SKILL.md`  |
| `codex`       | `$TARGET/.codex/skills/prose-lang/SKILL.md`         |
| `antigravity` | `$TARGET/.agent/skills/prose-lang/SKILL.md`         |

Re-running the installer upgrades existing files in place.
