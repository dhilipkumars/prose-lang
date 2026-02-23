---
identifier: speckit.prose-lang.test
description: Validate that the generated implementation matches the Behaviors defined in the .prose specification.
---

# prose.test

Use this command to validate that the implementation matches the Behaviors defined in the Prose file.

## Procedure

1. **Select Strategy**:
   * **Unit Tests** — Look at the **Behaviors** section. Generate and run a test file (e.g., `main_test.go`) that asserts these specific logic rules.
   * **E2E / Flow** — Look at the **Screen/Flow** section. Simulate the user inputs described and check for the defined Reaction.

2. **Execute** — Run the standard test command for the stack:

   | Stack | Command |
   |-------|---------|
   | Go | `go test ./...` |
   | Node/JS | `npm test` |
   | Python | `pytest` |

3. **Report** — Summarise the pass/fail status. If a test fails, analyse whether the code or the `.prose` spec needs to be updated.
