---
identifier: speckit.prose-lang.generate
description: Compile a .prose specification into source code. The AI agent acts as the compiler, parsing the prose and generating target-language files.
---

# prose.generate

Use this command when the user creates or updates a `.prose` file and wants to sync the design to executable code. **You are the compiler.**

## Procedure

1. **Sync Check (TOKEN OPTIMIZATION)** — **ALWAYS** run the bundled hash-check script before reading the source file.

   ```bash
   python3 .prose/scripts/check_sync.py [source_file] [metadata_file]
   ```

   * `source_file` — the `.prose` file to compile.
   * `metadata_file` — `./generated/[app-name]/[app-name].prose.md5`

2. **Decision**
   - If `needsGeneration` is `false` → **STOP**. Inform the user the code is up to date.
   - If `needsGeneration` is `true` → proceed.

3. **Read Source** — Execute `read_file` on the `.prose` file. Do **not** rely on conversation history.

4. **Analyze Stack** — Identify the target technology (Go, Python, React, etc.) from the `Stack` field.

5. **Compile** (mental step):
   * Map **Memory** items → data structures / models.
   * Map **Behaviors** → logic functions / handlers.
   * Map **Screen/Flow** → UI components or API routes.

6. **Generate Files** — Write source files to `./generated/[app-name]/`.

7. **Update Metadata** — Write the new hash to `./generated/[app-name]/[app-name].prose.md5`.

8. **Verify** — Confirm the files were written successfully.
