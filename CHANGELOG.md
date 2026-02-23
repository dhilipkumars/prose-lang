# Changelog

All notable changes to the Prose-Lang project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and
this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2025-02-21

### Added
- Initial release as a Spec Kit extension.
- `.prose` file format with Context, Memory, Behaviors, Screen/Flow, and Interface sections.
- Five spec-kit commands: `prose.generate`, `prose.build`, `prose.test`, `prose.document`, `prose.publish`.
- `check_sync.py` — hash-based sync check script to avoid unnecessary regeneration.
- Multi-agent installer (`prose-install`) supporting Gemini, Claude, Copilot, Codex, and Antigravity.
- Language specification installed to `.prose/specification.md`.
- Agent skills template installed to agent-specific skill directories.
- Bundled scripts installed to `.prose/scripts/`.
