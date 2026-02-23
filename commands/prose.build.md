---
identifier: speckit.prose-lang.build
description: Build generated source code into deployable artifacts (binaries, containers, archives).
---

# prose.build

Use this command to transform generated code into a deployable artifact using standard build tools.

## Procedure

1. **Detect Stack** — Check the `./generated/` folder to determine the build tool needed.

2. **Execute Build** — Run the appropriate build command:

   | Stack | Command |
   |-------|---------|
   | Go | `go build -o ./dist/app ./generated/...` |
   | Node/JS | `npm install && npm run build` |
   | Python | Create `requirements.txt`, run `pip install -r requirements.txt` |
   | Docker | Write a `Dockerfile`, run `docker build -t [app-name] .` |

3. **Output** — Report the location of the compiled artifact (e.g., "Binary created at `./dist/app`").
