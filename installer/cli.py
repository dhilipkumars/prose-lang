#!/usr/bin/env python3
"""
Prose-Lang Installer CLI

Installs the prose-lang specification and AI agent skills into a project
(local) or the user's home directory (global).

Usage:
    prose-install --scope local  --agent gemini
    prose-install --scope global --agent claude
"""

import argparse
import shutil
import sys
from pathlib import Path

# ── Version ──────────────────────────────────────────────────────────────────
VERSION = "0.1.0"

# ── Agent configuration ─────────────────────────────────────────────────────
AGENT_SKILL_PATHS = {
    "gemini":      ".gemini/skills",
    "claude":      ".claude/skills",
    "copilot":     ".github/instructions",
    "codex":       ".codex/skills",
    "antigravity": ".agent/skills",
}

SUPPORTED_AGENTS = sorted(AGENT_SKILL_PATHS.keys())

# ── Colours (ANSI) ──────────────────────────────────────────────────────────
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


# ── Data resolution ─────────────────────────────────────────────────────────

def _resolve_data_dir() -> Path:
    """Find the data directory containing spec and skills-template.

    When installed as a package (via uv / pip), hatchling bundles
    spec files into  installer/_data/ inside the wheel.

    When running from a repo checkout, fall back to  ../spec/ relative
    to this file.
    """
    # 1. Installed package — _data/ lives next to this module
    pkg_data = Path(__file__).resolve().parent / "_data"
    if pkg_data.is_dir():
        return pkg_data

    # 2. Development / repo checkout — ../spec/ from installer/
    repo_spec = Path(__file__).resolve().parent.parent / "spec"
    if repo_spec.is_dir():
        return repo_spec

    return pkg_data  # will fail later with a clear error


def _get_spec_source(data_dir: Path) -> Path:
    return data_dir / "specification.md"


def _get_skills_template_dir(data_dir: Path) -> Path:
    return data_dir / "skills-template"


def _get_scripts_dir(data_dir: Path) -> Path:
    return data_dir / "scripts"


# ── Pretty output ───────────────────────────────────────────────────────────

def _banner():
    print(f"""
{CYAN}{BOLD}╔══════════════════════════════════════════╗
║        🖊  Prose-Lang Installer  v{VERSION}   ║
╚══════════════════════════════════════════╝{RESET}
""")


def _ok(msg: str):
    print(f"  {GREEN}✔{RESET}  {msg}")


def _warn(msg: str):
    print(f"  {YELLOW}⚠{RESET}  {msg}")


def _err(msg: str):
    print(f"  {RED}✖{RESET}  {msg}")


def _info(msg: str):
    print(f"  {CYAN}→{RESET}  {msg}")


# ── Core install functions ───────────────────────────────────────────────────

def resolve_target(scope: str) -> Path:
    """Return the root directory where files will be installed."""
    if scope == "global":
        return Path.home()
    return Path.cwd()


def install_spec(target: Path, data_dir: Path) -> None:
    """Install (or upgrade) the language specification into $TARGET/.prose/."""
    spec_src = _get_spec_source(data_dir)
    dest_dir = target / ".prose"
    dest_file = dest_dir / "specification.md"

    if not spec_src.exists():
        _err(f"Specification source not found: {spec_src}")
        sys.exit(1)

    dest_dir.mkdir(parents=True, exist_ok=True)

    action = "Upgraded" if dest_file.exists() else "Installed"
    shutil.copy2(spec_src, dest_file)
    _ok(f"{action} specification → {dest_file}")


def install_skills(target: Path, agent: str, data_dir: Path) -> None:
    """Install agent skills from the canonical template."""
    skills_dir = _get_skills_template_dir(data_dir)

    if not skills_dir.exists():
        _err(f"Skills template directory not found: {skills_dir}")
        sys.exit(1)

    rel_dest = AGENT_SKILL_PATHS[agent]
    dest_dir = target / rel_dest

    copied = 0
    for src_file in skills_dir.rglob("*"):
        if src_file.is_dir():
            continue
        rel = src_file.relative_to(skills_dir)
        dest_file = dest_dir / rel

        dest_file.parent.mkdir(parents=True, exist_ok=True)

        action = "Upgraded" if dest_file.exists() else "Installed"
        shutil.copy2(src_file, dest_file)
        _ok(f"{action} skill → {dest_file}")
        copied += 1

    if copied == 0:
        _warn("No skill template files found to install.")


def install_scripts(target: Path, data_dir: Path) -> None:
    """Install bundled scripts into $TARGET/.prose/scripts/."""
    scripts_src = _get_scripts_dir(data_dir)

    if not scripts_src.exists():
        _warn("Scripts source directory not found — skipping.")
        return

    dest_dir = target / ".prose" / "scripts"

    copied = 0
    for src_file in scripts_src.rglob("*"):
        if src_file.is_dir():
            continue
        rel = src_file.relative_to(scripts_src)
        dest_file = dest_dir / rel

        dest_file.parent.mkdir(parents=True, exist_ok=True)

        action = "Upgraded" if dest_file.exists() else "Installed"
        shutil.copy2(src_file, dest_file)
        _ok(f"{action} script → {dest_file}")
        copied += 1

    if copied == 0:
        _warn("No script files found to install.")


# ── CLI ──────────────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="prose-install",
        description="Install prose-lang specification and AI agent skills.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  %(prog)s --scope local  --agent gemini       # install into CWD
  %(prog)s --scope global --agent claude        # install into ~/
  %(prog)s --scope local  --agent copilot       # install into CWD for Copilot
        """,
    )
    parser.add_argument(
        "--scope",
        required=True,
        choices=["local", "global"],
        help="local = install into CWD, global = install into home directory",
    )
    parser.add_argument(
        "--agent",
        required=True,
        choices=SUPPORTED_AGENTS,
        help=f"AI agent to install skills for ({', '.join(SUPPORTED_AGENTS)})",
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {VERSION}",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    _banner()

    data_dir = _resolve_data_dir()
    target = resolve_target(args.scope)

    _info(f"Scope   : {BOLD}{args.scope}{RESET}")
    _info(f"Agent   : {BOLD}{args.agent}{RESET}")
    _info(f"Target  : {BOLD}{target}{RESET}")
    print()

    # Step 1: Install / upgrade the language specification
    _info(f"{BOLD}Installing specification …{RESET}")
    install_spec(target, data_dir)
    print()

    # Step 2: Install / upgrade agent skills
    _info(f"{BOLD}Installing {args.agent} agent skills …{RESET}")
    install_skills(target, args.agent, data_dir)
    print()

    # Step 3: Install / upgrade bundled scripts
    _info(f"{BOLD}Installing scripts …{RESET}")
    install_scripts(target, data_dir)
    print()

    print(f"{GREEN}{BOLD}  Done!{RESET}  Prose-lang is ready. 🚀\n")


if __name__ == "__main__":
    main()
