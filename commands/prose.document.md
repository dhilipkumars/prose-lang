---
identifier: speckit.prose-lang.document
description: Auto-generate documentation (README, API reference, user guide) from a .prose specification.
---

# prose.document

Use this command to create user guides or API references based on the readable Prose spec.

## Procedure

1. **Synthesise** — Read the `.prose` file.

2. **Write `README.md`** — Create a Markdown file in the project root containing:
   * **Overview** — Derived from the Context / "About the App" section.
   * **Features** — Derived from the **Behaviors** section.
   * **Data Dictionary** — Derived from the **Memory** section.
   * **Usage Guide** — Derived from the **Screen/Flow** section.
