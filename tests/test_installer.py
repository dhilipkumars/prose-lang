"""Tests for installer/cli.py — the prose-install CLI."""

import shutil
from pathlib import Path
from unittest.mock import patch

import pytest

from installer.cli import (
    AGENT_SKILL_PATHS,
    install_scripts,
    install_skills,
    install_spec,
    resolve_target,
)


# ── Fixtures ────────────────────────────────────────────────────────────────


@pytest.fixture()
def data_dir(tmp_path: Path) -> Path:
    """Create a fake data directory mirroring spec/."""
    d = tmp_path / "data"

    # specification.md
    spec = d / "specification.md"
    spec.parent.mkdir(parents=True)
    spec.write_text("# Specification\n")

    # skills-template/prose-lang/SKILL.md
    skill = d / "skills-template" / "prose-lang" / "SKILL.md"
    skill.parent.mkdir(parents=True)
    skill.write_text("---\nname: prose-lang\n---\n")

    # scripts/check_sync.py
    script = d / "scripts" / "check_sync.py"
    script.parent.mkdir(parents=True)
    script.write_text("#!/usr/bin/env python3\n")

    return d


@pytest.fixture()
def target_dir(tmp_path: Path) -> Path:
    """Return an empty target directory."""
    t = tmp_path / "project"
    t.mkdir()
    return t


# ── resolve_target ──────────────────────────────────────────────────────────


class TestResolveTarget:
    def test_local_scope_returns_cwd(self):
        target = resolve_target("local")
        assert target == Path.cwd()

    def test_global_scope_returns_home(self):
        target = resolve_target("global")
        assert target == Path.home()


# ── install_spec ────────────────────────────────────────────────────────────


class TestInstallSpec:
    def test_fresh_install(self, target_dir, data_dir):
        install_spec(target_dir, data_dir)

        dest = target_dir / ".prose" / "specification.md"
        assert dest.exists()
        assert dest.read_text() == "# Specification\n"

    def test_upgrade_overwrites(self, target_dir, data_dir):
        # Pre-existing old version
        dest = target_dir / ".prose" / "specification.md"
        dest.parent.mkdir(parents=True)
        dest.write_text("old content")

        install_spec(target_dir, data_dir)
        assert dest.read_text() == "# Specification\n"

    def test_missing_spec_source_exits(self, target_dir, tmp_path):
        empty_data = tmp_path / "empty_data"
        empty_data.mkdir()
        # No specification.md → should exit
        with pytest.raises(SystemExit):
            install_spec(target_dir, empty_data)


# ── install_skills ──────────────────────────────────────────────────────────


class TestInstallSkills:
    @pytest.mark.parametrize("agent", list(AGENT_SKILL_PATHS.keys()))
    def test_installs_to_correct_agent_path(self, target_dir, data_dir, agent):
        install_skills(target_dir, agent, data_dir)

        expected = target_dir / AGENT_SKILL_PATHS[agent] / "prose-lang" / "SKILL.md"
        assert expected.exists()

    def test_upgrade_overwrites(self, target_dir, data_dir):
        agent = "gemini"
        dest = (
            target_dir
            / AGENT_SKILL_PATHS[agent]
            / "prose-lang"
            / "SKILL.md"
        )
        dest.parent.mkdir(parents=True)
        dest.write_text("old skill")

        install_skills(target_dir, agent, data_dir)
        assert dest.read_text() == "---\nname: prose-lang\n---\n"

    def test_missing_skills_dir_exits(self, target_dir, tmp_path):
        empty_data = tmp_path / "empty_data"
        empty_data.mkdir()
        with pytest.raises(SystemExit):
            install_skills(target_dir, "gemini", empty_data)


# ── install_scripts ─────────────────────────────────────────────────────────


class TestInstallScripts:
    def test_fresh_install(self, target_dir, data_dir):
        install_scripts(target_dir, data_dir)

        dest = target_dir / ".prose" / "scripts" / "check_sync.py"
        assert dest.exists()
        assert dest.read_text() == "#!/usr/bin/env python3\n"

    def test_upgrade_overwrites(self, target_dir, data_dir):
        dest = target_dir / ".prose" / "scripts" / "check_sync.py"
        dest.parent.mkdir(parents=True)
        dest.write_text("old script")

        install_scripts(target_dir, data_dir)
        assert dest.read_text() == "#!/usr/bin/env python3\n"

    def test_missing_scripts_dir_warns(self, target_dir, tmp_path, capsys):
        """Missing scripts source should warn, not crash."""
        empty_data = tmp_path / "empty_data"
        empty_data.mkdir()

        install_scripts(target_dir, empty_data)

        out = capsys.readouterr().out
        assert "skipping" in out.lower() or "⚠" in out


# ── Full install flow (integration) ─────────────────────────────────────────


class TestFullInstall:
    def test_all_three_steps(self, target_dir, data_dir):
        """Simulate a full prose-install --scope local --agent gemini."""
        agent = "gemini"

        install_spec(target_dir, data_dir)
        install_skills(target_dir, agent, data_dir)
        install_scripts(target_dir, data_dir)

        assert (target_dir / ".prose" / "specification.md").exists()
        assert (
            target_dir / AGENT_SKILL_PATHS[agent] / "prose-lang" / "SKILL.md"
        ).exists()
        assert (target_dir / ".prose" / "scripts" / "check_sync.py").exists()
