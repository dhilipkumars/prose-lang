#!/usr/bin/env python3
"""
check_sync.py — Check whether a .prose source file is out of sync
with its stored metadata hash or prose.lock file.

Usage:
    python3 check_sync.py <source_file> <metadata_file>

Outputs a JSON object to stdout with:
    status, sourceFile, currentHash, storedHash, currentRequirementsHash,
    storedRequirementsHash, requirementsChanged, isOutOfSync, needsGeneration
"""

import hashlib
import json
import re
import sys
from pathlib import Path

PROSE_SECTIONS = ("Context", "Memory", "Behaviors", "Interface", "Tests")
BLOCK_PATTERN = re.compile(r"^#{1,2}\s+([A-Za-z][A-Za-z ]*)\s*$")


def calculate_source_hash(source_file: Path) -> str:
    """Return the MD5 hash of the full .prose source file."""
    return hashlib.md5(source_file.read_bytes()).hexdigest()


def extract_block(content: str, block_name: str) -> str:
    """Return a named top-level Prose block, including its heading line."""
    lines = content.splitlines()
    capture = False
    block_lines = []

    for line in lines:
        match = BLOCK_PATTERN.match(line.strip())
        if match:
            heading = match.group(1).strip()
            if heading == block_name:
                capture = True
                block_lines = [line.rstrip()]
                continue

            if capture and heading in PROSE_SECTIONS:
                break

        if capture:
            block_lines.append(line.rstrip())

    return "\n".join(block_lines).strip()


def calculate_requirements_hash(source_file: Path) -> str:
    """Return a SHA256 hash of the `# Context` block used for lockfile checks."""
    context_block = extract_block(source_file.read_text(), "Context")
    return hashlib.sha256(context_block.encode("utf-8")).hexdigest()


def read_lock_file(lock_file: Path) -> dict:
    """Read a prose.lock JSON object containing `sourceHash` and `requirementsHash`."""
    data = json.loads(lock_file.read_text())
    if not isinstance(data, dict):
        raise ValueError(f"Invalid prose.lock format: {lock_file}")
    return data


def resolve_metadata_paths(source_file: Path, metadata_file: Path) -> tuple[Path, Path]:
    """Return the expected prose.lock path and legacy `.prose.md5` path."""
    if metadata_file.name == "prose.lock":
        lock_file = metadata_file
        legacy_hash_file = metadata_file.with_name(f"{source_file.name}.md5")
    else:
        lock_file = metadata_file.with_name("prose.lock")
        expected_legacy_name = f"{source_file.name}.md5"
        if metadata_file.name != expected_legacy_name:
            raise ValueError(
                f"Legacy metadata file must be named {expected_legacy_name}: {metadata_file}"
            )
        legacy_hash_file = metadata_file
    return lock_file, legacy_hash_file


def read_stored_metadata(source_file: Path, metadata_file: Path) -> tuple[Path, str | None, str | None]:
    """Return `(lock_file, stored_hash, stored_requirements_hash)` from available metadata."""
    lock_file, legacy_hash_file = resolve_metadata_paths(source_file, metadata_file)

    stored_hash = None
    stored_requirements_hash = None

    if lock_file.exists():
        lock_data = read_lock_file(lock_file)
        stored_hash = lock_data.get("sourceHash")
        stored_requirements_hash = lock_data.get("requirementsHash")
    elif legacy_hash_file.exists():
        stored_hash = legacy_hash_file.read_text().strip()

    return lock_file, stored_hash, stored_requirements_hash


def main():
    if len(sys.argv) < 3:
        print(
            "Usage: python3 check_sync.py <source_file> <metadata_file>",
            file=sys.stderr,
        )
        sys.exit(1)

    source_file = Path(sys.argv[1])
    metadata_file = Path(sys.argv[2])

    try:
        if not source_file.exists():
            print(
                json.dumps(
                    {"status": "error", "message": f"Source file not found: {source_file}"}
                )
            )
            sys.exit(0)

        current_hash = calculate_source_hash(source_file)
        current_requirements_hash = calculate_requirements_hash(source_file)
        lock_file, stored_hash, stored_requirements_hash = read_stored_metadata(
            source_file, metadata_file
        )

        is_out_of_sync = current_hash != stored_hash
        requirements_changed = (
            stored_requirements_hash is not None
            and current_requirements_hash != stored_requirements_hash
        )

        print(
            json.dumps(
                {
                    "status": "success",
                    "sourceFile": str(source_file.resolve()),
                    "lockFile": str(lock_file.resolve()),
                    "currentHash": current_hash,
                    "storedHash": stored_hash,
                    "currentRequirementsHash": current_requirements_hash,
                    "storedRequirementsHash": stored_requirements_hash,
                    "requirementsChanged": requirements_changed,
                    "isOutOfSync": is_out_of_sync,
                    "needsGeneration": is_out_of_sync or stored_hash is None,
                },
                indent=2,
            )
        )

    except Exception as exc:
        print(json.dumps({"status": "error", "message": str(exc)}))


if __name__ == "__main__":
    main()
