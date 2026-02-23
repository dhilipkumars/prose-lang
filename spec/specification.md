# Agent Skills: Prose Compiler Toolchain

## 1. Context
Type: System Agent Skills (CLI & API)
Description: A suite of capabilities allowing an AI Agent to compile, build, test, and deploy applications defined in the Prose Language.
Target System: Local Development Environment or CI/CD Runner.

## 2. Memory (The Workspace)
- **Project Root**: The base directory of the current project.
- **Source Path**: Location of `.prose` files (Default: `./src`).
- **Gen Path**: Location of generated code (Default: `./generated`).
- **Dist Path**: Location of compiled artifacts (Default: `./dist`).
- **Config**:
  - `Environment`: dev, test, or prod.
  - `Verbose`: Boolean flag for logs.

## 3. Skills (Behaviors)

### Skill: `prose.generate`
**Description**: Transforms the high-level `.prose` design file into executable source code (Go, Python, React, etc.).
- **Inputs**:
  - `file_pattern` (string): The specific file to compile (e.g., "main.prose") or "*" for all.
- **Procedure**:
  1. **SCAN** `Source Path` for files matching `file_pattern`.
  2. **FOR EACH** found file:
     a. **PARSE** the Markdown structure into an Abstract Syntax Tree (AST).
     b. **RESOLVE** references (e.g., linking "Flows" to "Behaviors").
     c. **INVOKE** the DSPy Generator to produce code based on the defined "Stack".
     d. **WRITE** the resulting code files into `Gen Path`, maintaining folder structure.
  3. **OUTPUT** a summary of files created.

### Skill: `prose.build`
**Description**: Compiles the generated source code into deployable artifacts (Binaries, Docker Images, Archives).
- **Inputs**:
  - `target_os` (string, optional): e.g., "linux", "windows".
  - `containerize` (boolean): If true, builds a Docker image.
- **Procedure**:
  1. **DETECT** the Technology Stack from the generated source in `Gen Path`.
  2. **EXECUTE** native build commands:
     - If Go: `go build -o [Dist Path]/app [Gen Path]/main.go`
     - If Node: `npm install && npm run build`
     - If Python: Create `requirements.txt` and virtualenv.
  3. **IF** `containerize` is TRUE:
     - **READ** the generated `Dockerfile`.
     - **RUN** `docker build -t [App Name]:latest .`
  4. **MOVE** final binaries/assets to `Dist Path`.

### Skill: `prose.test`
**Description**: Runs the End-to-End (E2E) test suite defined in the `.prose` file's "Flow" section.
- **Inputs**:
  - `mode` (enum): "unit" (logic only) or "e2e" (full simulation).
- **Procedure**:
  1. **SETUP** a clean test environment (Ephemeral DBs, Mock APIs).
  2. **LOAD** the "Flows" from the `.prose` file.
  3. **FOR EACH** Flow:
     a. **SIMULATE** the Trigger (e.g., HTTP Request or CLI Input).
     b. **ASSERT** that the "Reaction" matches the expected state change defined in "Behaviors".
  4. **REPORT** pass/fail status for each Flow.
  5. **TEARDOWN** the test environment.

### Skill: `prose.document`
**Description**: Auto-generates human-readable documentation, API references, and user guides from the prose source.
- **Inputs**:
  - `format` (enum): "markdown", "html", "pdf".
- **Procedure**:
  1. **EXTRACT** "About the App" (Metadata) for the Introduction.
  2. **EXTRACT** "Behaviors" to create a "Features Guide".
  3. **EXTRACT** "Interface" to create an "API Reference" or "User Manual".
  4. **GENERATE** diagrams (MermaidJS) for all Flows.
  5. **COMPILE** into a single document `README.md` or `Guide.html` in the Project Root.

### Skill: `prose.publish`
**Description**: Handles the release lifecycle, tagging version control, and pushing artifacts to registries.
- **Inputs**:
  - `bump_type` (enum): "major", "minor", "patch".
  - `registry` (string): Target URL (e.g., "docker.io", "npm", "s3").
- **Procedure**:
  1. **VALIDATE** that `prose.test` passes.
  2. **READ** current version from `.prose` file and increment based on `bump_type`.
  3. **UPDATE** the `.prose` file with the new version.
  4. **COMMIT** & **TAG** the changes in Git.
  5. **PUSH** the artifacts from `Dist Path` to the specified `registry`.
  6. **NOTIFY** success via CLI output.

## 4. Interface (CLI Mapping)
- `prose gen [file]` -> triggers `prose.generate`
- `prose build --docker` -> triggers `prose.build(containerize=true)`
- `prose test` -> triggers `prose.test`
- `prose doc` -> triggers `prose.document`
- `prose release [major|minor|patch]` -> triggers `prose.publish`