---
name: prose-lang
description: Develop, compile, build, test, and publish applications using the Prose-Lang methodology. Use this skill when the user wants to work with .prose files, generate source code from design specs, or manage the lifecycle of a Prose application.
---

# Prose-Lang Developer

This skill empowers the Agent to act as the **Prose Compiler**. You will interpret high-level `.prose` specifications and manually generate the corresponding source code, build artifacts, and documentation.

## Specification
The specification is usually in the `.prose/specification.md` refer and cache that to remember the format and syntax of the langague. 


## When to use this skill
- When the user asks to "compile", "build", or "generate code" from a `.prose` file.
- When the user wants to "run tests" or "deploy" a Prose project.
- When the user needs documentation generated from their Prose design.


## Workflows

### 1. Generating Source Code (`prose.generate`)
Use this workflow when the user creates/updates a `.prose` file or asks to "sync" the design to code. **You are the compiler.**

1.  **Sync Check (TOKEN OPTIMIZATION)**: **ALWAYS** execute the bundled script `.prose/scripts/check_sync.py` **BEFORE** reading the source file.
    * Run: `python3 .prose/scripts/check_sync.py [source_file] [metadata_file]`
    * Metadata file location: `./generated/[app-name]/[app-name].prose.md5`
2.  **Decision**: 
    - If `needsGeneration` is `false`: **STOP HERE**. Skip `read_file`. Inform the user that the code is up to date.
    - If `needsGeneration` is `true`: Proceed to the next step.
3.  **Read Source (MANDATORY)**: Execute `read_file` on the target `.prose` file ONLY if the sync check confirms it is out of date. DO NOT rely on your conversation history.
4.  **Analyze Stack**: Identify the target technology stack (e.g., Go, Python, React).
6.  **Compile (Mental Step)**:
    * Map "Memory" items to data structures.
    * Map "Behaviors" to logic functions.
    * Map "Screen/Flow" to UI components or API routes.
7.  **Generate Files**: Write the actual source code files to the `./generated/[app-name]` directory.
8.  **Update Metadata**: Write the new hash to the `./generated/[app-name]/[app-name].prose.md5` metadata file.
9.  **Verify**: Confirm the files were written successfully.

### 2. Building Artifacts (`prose.build`)
Use this workflow to transform the generated code into a deployable artifact using standard system tools.

1.  **Detect Stack**: check the `./generated` folder to determine the build tool needed.
2.  **Execute Build**:
    * **Go**: Run `go build -o ./dist/app ./generated/...`
    * **Node/JS**: Run `npm install` and `npm run build`.
    * **Python**: Create a `requirements.txt` and ensure `pip install -r requirements.txt` passes.
    * **Docker**: If the user requested a container, write a `Dockerfile` relative to the stack and run `docker build -t [app-name] .`
3.  **Output**: Report the location of the compiled artifact (e.g., "Binary created at ./dist/app").

### 3. Testing Logic (`prose.test`)
Use this workflow to validate that the implementation matches the "Behaviors" defined in the Prose file.

1.  **Select Strategy**:
    * **Unit Tests**: Look at the "Behaviors" section. Generate and run a test file (e.g., `main_test.go`) that asserts these specific logic rules.
    * **E2E/Flow**: Look at the "Screen/Flow" section. Simulate the user inputs described and check for the defined "Reaction".
2.  **Execute**: Run the standard test command for the stack (e.g., `go test ./...`, `npm test`, `pytest`).
3.  **Report**: Summarize the pass/fail status. If a test fails, analyze whether the code or the `.prose` spec needs to be updated.

### 4. Documentation (`prose.document`)
Use this workflow to create user guides or API references based on the readable Prose spec.

1.  **Synthesize**: Read the `.prose` file.
2.  **Write `README.md`**: Create a Markdown file in the project root containing:
    * **Overview**: Derived from "About the App".
    * **Features**: Derived from "Behaviors".
    * **Data Dictionary**: Derived from "Memory".
    * **Usage Guide**: Derived from "Screen/Flow".

### 5. Publishing (`prose.publish`)
Use this workflow to release the project.

1.  **Pre-flight**: Run the **Testing Logic** workflow first. Stop if it fails.
2.  **Versioning**:
    * Read the current version in the `.prose` file.
    * Increment it based on the user's request (major/minor/patch).
    * Update the `.prose` file text with the new version.
3.  **Tag & Push**:
    * Run `git add .`, `git commit -m "Release v[Version]"`, and `git tag v[Version]`.
    * Run `git push --tags`.
    * (Optional) If Docker, run `docker push [tag]`.
