#!/usr/bin/env python3
"""
check_sync.py — Check whether a .prose source file is out of sync
with its stored metadata hash.

Usage:
    python3 check_sync.py <source_file> <metadata_file>

Outputs a JSON object to stdout with:
    status, sourceFile, currentHash, storedHash, isOutOfSync, needsGeneration
"""

import hashlib
import json
import sys
from pathlib import Path


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

        current_hash = hashlib.md5(source_file.read_bytes()).hexdigest()

        stored_hash = None
        if metadata_file.exists():
            stored_hash = metadata_file.read_text().strip()

        is_out_of_sync = current_hash != stored_hash

        print(
            json.dumps(
                {
                    "status": "success",
                    "sourceFile": str(source_file.resolve()),
                    "currentHash": current_hash,
                    "storedHash": stored_hash,
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
