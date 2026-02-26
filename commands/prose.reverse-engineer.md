---
name: prose.reverse-engineer
description: Analyze an existing codebase and generate comprehensive .prose specifications for it.
---

# `prose.reverse-engineer`

Use this workflow to reverse-engineer an existing codebase and capture its full architectural and behavioral intent into `.prose` files.

1.  **Analyze Intricate Details**: Read through the existing codebase carefully. Ensure you capture logic edge cases, algorithm specifics, and exact requirements. Default to using algorithmic pseudocode (e.g. AP CSP or CLRS) to represent the logic. Only use `@prose_strict_block` if explicitly approved by the user, even if it is very difficult to represent the code as pseudo-code.
2.  **Break Down and Structure**: Do not create a single monolithic `.prose` file for large projects. Break the problem into multiple `.prose` files inside an organized directory structure (e.g., `src/core.prose`, `src/api.prose`).
3.  **Module Dependencies**: Explicitly document and retain the architectural dependencies between modules to ensure they compile smoothly.
4.  **Document Tests for Parity (Critical)**: Extract and exactly document the existing test cases, test data, and testing execution commands. The code later generated from these `.prose` files MUST be able to be tested with the exactly same tests to guarantee functional parity. Document these testing mechanisms directly in the `.prose` specifications.
