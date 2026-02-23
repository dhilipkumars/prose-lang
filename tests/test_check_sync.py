"""Tests for spec/scripts/check_sync.py — hash-based sync checker."""

import hashlib
import json
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parent.parent / "spec" / "scripts" / "check_sync.py"


def _run(args: list[str]) -> subprocess.CompletedProcess:
    """Run check_sync.py with the given arguments."""
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        capture_output=True,
        text=True,
    )


# ── Happy-path tests ────────────────────────────────────────────────────────


class TestOutOfSync:
    """Source hash does not match stored hash → needs generation."""

    def test_wrong_hash(self, tmp_path):
        src = tmp_path / "app.prose"
        src.write_text("hello world")

        meta = tmp_path / "app.prose.md5"
        meta.write_text("wrong_hash")

        result = _run([str(src), str(meta)])
        assert result.returncode == 0

        data = json.loads(result.stdout)
        assert data["status"] == "success"
        assert data["isOutOfSync"] is True
        assert data["needsGeneration"] is True
        assert data["currentHash"] == hashlib.md5(b"hello world").hexdigest()
        assert data["storedHash"] == "wrong_hash"

    def test_no_metadata_file(self, tmp_path):
        """First generation — metadata file does not exist yet."""
        src = tmp_path / "app.prose"
        src.write_text("hello world")

        meta = tmp_path / "app.prose.md5"  # does not exist

        result = _run([str(src), str(meta)])
        assert result.returncode == 0

        data = json.loads(result.stdout)
        assert data["status"] == "success"
        assert data["isOutOfSync"] is True
        assert data["needsGeneration"] is True
        assert data["storedHash"] is None


class TestInSync:
    """Source hash matches stored hash → skip generation."""

    def test_matching_hash(self, tmp_path):
        content = b"hello world"
        correct_hash = hashlib.md5(content).hexdigest()

        src = tmp_path / "app.prose"
        src.write_bytes(content)

        meta = tmp_path / "app.prose.md5"
        meta.write_text(correct_hash)

        result = _run([str(src), str(meta)])
        assert result.returncode == 0

        data = json.loads(result.stdout)
        assert data["status"] == "success"
        assert data["isOutOfSync"] is False
        assert data["needsGeneration"] is False
        assert data["currentHash"] == correct_hash
        assert data["storedHash"] == correct_hash


# ── Error-path tests ────────────────────────────────────────────────────────


class TestErrors:
    def test_missing_source_file(self, tmp_path):
        """Source file does not exist → status error, exit 0."""
        meta = tmp_path / "app.prose.md5"
        meta.write_text("abc123")

        result = _run([str(tmp_path / "missing.prose"), str(meta)])
        assert result.returncode == 0

        data = json.loads(result.stdout)
        assert data["status"] == "error"
        assert "not found" in data["message"]

    def test_no_arguments(self):
        """No arguments → usage message on stderr, exit 1."""
        result = _run([])
        assert result.returncode == 1
        assert "Usage" in result.stderr

    def test_one_argument(self, tmp_path):
        """Only one argument → exit 1."""
        src = tmp_path / "app.prose"
        src.write_text("content")

        result = _run([str(src)])
        assert result.returncode == 1


# ── Edge cases ──────────────────────────────────────────────────────────────


class TestEdgeCases:
    def test_empty_file(self, tmp_path):
        """Empty source file should still produce a valid hash."""
        src = tmp_path / "empty.prose"
        src.write_bytes(b"")

        meta = tmp_path / "empty.prose.md5"

        result = _run([str(src), str(meta)])
        data = json.loads(result.stdout)

        assert data["status"] == "success"
        assert data["currentHash"] == hashlib.md5(b"").hexdigest()
        assert data["needsGeneration"] is True

    def test_hash_with_trailing_newline(self, tmp_path):
        """Stored hash with trailing newline should be stripped."""
        content = b"hello world"
        correct_hash = hashlib.md5(content).hexdigest()

        src = tmp_path / "app.prose"
        src.write_bytes(content)

        meta = tmp_path / "app.prose.md5"
        meta.write_text(correct_hash + "\n")

        result = _run([str(src), str(meta)])
        data = json.loads(result.stdout)

        assert data["isOutOfSync"] is False
        assert data["needsGeneration"] is False

    def test_source_file_path_is_resolved(self, tmp_path):
        """Output sourceFile should be an absolute resolved path."""
        src = tmp_path / "app.prose"
        src.write_text("content")

        meta = tmp_path / "app.prose.md5"

        result = _run([str(src), str(meta)])
        data = json.loads(result.stdout)

        assert Path(data["sourceFile"]).is_absolute()
