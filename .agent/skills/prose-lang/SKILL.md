---
name: prose-lang
description: Develop, compile, build, test, and publish applications using the Prose-Lang methodology. Use this skill when the user wants to work with .prose files, generate source code from design specs, or manage the lifecycle of a Prose application.
---

# Prose-Lang Developer

This skill empowers the Agent to act as the **Prose Compiler**. You will interpret high-level `.prose` specifications and manually generate the corresponding source code, build artifacts, and documentation.

## Specification
The specification is usually in the `.prose/specification.md` refer and cache that to remember the format and syntax of the langague. 

## Compiler Rules (CRITICAL)
1. **The 5 Mandatory Blocks**: Every `.prose` file MUST have five sections: `# Context`, `# Memory`, `# Behaviors`, `# Interface`, and `# Tests`. If one of these sections is missing, **THROW AN ERROR** and stop compilation. You may ask the user if they'd like you to auto-add the missing sections.
2. **Strict Test Coverage**: During `generate`, `build`, or `test`, check the `# Tests` section. Each behavior in the file MUST have corresponding tests. If absent, you MUST ask the user for explicit permission to bypass the check before proceeding.
3. **Strict Mode (`@prose_strict_block`)**: If you see `@prose_strict_block` surrounding a block of code or pseudo-code, you MUST exactly match that logic or drop-in replace it. Do not interpret or paraphrase. Generating these blocks during reverse-engineering requires explicit user approval.
4. **Reverse Engineering**: When running `prose.reverse-engineer`, ALWAYS auto-populate the `# Tests` section with the original test suites to ensure parity.
5. **Logic Resolution & Ambiguity**: **DO NOT GUESS OR INFER LOGIC.** If the user's proposed logic is overly vague, ambiguous, or lacks sufficient detail (e.g., "create a REST interface for basic CRUD operations"), you MUST **PAUSE, ask clarifying questions, and wait for the user's response** before generating any code. Once clarified, reformat the logic into one of the supported pseudocode standards (Cambridge, AP CSP, or CLRS) to ensure deterministic compilation.
6. **Assumption Disclosure (CRITICAL)**: If you need to make **any** design decision or implementation choice that is NOT explicitly stated in the `.prose` file (e.g., choosing a specific PRNG algorithm for cross-language parity, selecting a hashing strategy, picking a data serialization format), you MUST **PAUSE** and disclose the assumption to the user. Present the assumption clearly, explain why it is needed, and ask the user to **update the `.prose` specification** with the decision before you proceed to generate code. The `.prose` file must always be the single source of truth — not the compiler agent's judgment.

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
    * **Logic Resolution & Ambiguity**: If any behavior, algorithm, or requirement is ambiguous or lacks necessary detail, **STOP**. Do NOT proceed to generate code. Ask the user clarifying questions and wait for their response. Once clarified, reformat the logic into one of the supported pseudocode standards (Cambridge, AP CSP, or CLRS).
    * **Assumption Disclosure**: Before writing any code, review all implementation decisions you are about to make. If ANY decision is not explicitly documented in the `.prose` file (e.g., choice of random number generator, serialization format, concurrency model), **STOP**. Disclose the assumption to the user and ask them to update the `.prose` spec before proceeding.
7.  **Generate Files**: Write the actual source code files to the `./generated/[app-name]` directory.
8.  **Update Metadata**: Write the new hash to the `./generated/[app-name]/[app-name].prose.md5` metadata file.
9.  **Verify**: Confirm the files were written successfully.

### 2. Building Artifacts (`prose.build`)
Use this workflow to transform the generated code into a deployable artifact using standard system tools.

1.  **Detect Stack**: check the `./generated` folder to determine the build tool needed.
2.  **Ambiguity Check**: Before executing the build, ensure all logic in the specification was deterministic. If any logic was ambiguous and bypassed during generation, **STOP**, ask clarifying questions, and reformat it into a supported pseudocode standard before proceeding. Do NOT guess the implementation.
3.  **Execute Build**:
    * **Go**: Run `go build -o ./dist/app ./generated/...`
    * **Node/JS**: Run `npm install` and `npm run build`.
    * **Python**: Create a `requirements.txt` and ensure `pip install -r requirements.txt` passes.
    * **Docker**: If the user requested a container, write a `Dockerfile` relative to the stack and run `docker build -t [app-name] .`
4.  **Output**: Report the location of the compiled artifact (e.g., "Binary created at ./dist/app").

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

### 6. Reverse Engineering (`prose.reverse-engineer`)
Use this workflow to analyze an existing codebase and construct an accurate `.prose` specification.

1.  **Analyze Intricate Details**: Read through the existing codebase carefully to capture all intricate details, logic edge cases, algorithm specifics, and exact mathematical operations if applicable. Be exhaustive. Default to standard algorithmic pseudocode. Only use `@prose_strict_block` if explicitly approved by the user, even if it is very difficult to represent the code as pseudo-code.
2.  **Break Down and Structure**: Do not create a single monolithic `.prose` file for large projects. Break the problem into multiple `.prose` files inside an organized directory structure (e.g., `src/core.prose`, `src/api.prose`).
3.  **Module Dependencies**: Explicitly document and retain the architectural dependencies between different modules and `.prose` files to ensure they can be compiled together smoothly.
4.  **Document Tests for Parity (Critical)**: Extract and document the existing test cases, test data, and testing execution commands exactly. The code generated from these `.prose` files MUST be able to be tested with the **exactly same tests** to guarantee true functional parity. Document these testing mechanisms directly in the `.prose` specifications.
