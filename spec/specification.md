# The Prose-Lang Specification

## Introduction

This is the reference manual for the Prose programming language. Prose is a declarative, natural-language-based specification language designed to be compiled into executable code by AI-driven compiler agents (such as the `prose-lang` skill). 

Unlike syntax-heavy languages (e.g., C++, Python, Go) where the compiler enforces strict grammar down to the semicolon, Prose enforces **Architectural Grammar**. Its purpose is to define the unshakeable architectural foundation, domain model, and business rules of an application, leaving the granular syntactic implementation up to the target language generation step.

## Source Code Representation

Source code is Unicode text encoded in UTF-8, saved in files with the `.prose` extension. A Prose application may consist of a single `.prose` file or a directory of multiple `.prose` files interconnected by domain logic.

## Program Structure

A valid Prose specification defines the architecture of a system or component using five mandatory, top-level block sections. The compiler agent expects these headers to exist to successfully interpret the domain boundaries. Missing any of these five critical sections will cause the compiler agent to throw an error, though it may offer to auto-add missing sections if possible.

The five blocks are:
1. `Context`
2. `Memory`
3. `Behaviors`
4. `Interface`
5. `Tests`

Each block must begin with a Markdown Heading 1 or Heading 2 (e.g., `# Context`).

---

## 1. Context

The `Context` block defines the environment, scope, and technical metadata of the application or module. It provides the compiler agent with the constraints required to generate correct scaffolding.

### Elements
*   **Type**: The architectural classification of the target (e.g., `CLI`, `Microservice`, `Library`, `SPA`).
*   **Stack**: The target programming language and framework (e.g., `Go`, `Python (FastAPI)`, `React/TypeScript`).
*   **Dependencies**: Explicit external libraries or systems the module relies upon (e.g., `PostgreSQL`, `Redis`).

### Example
```prose
# Context
Type: Reverse Proxy Microservice
Stack: Go (Standard Library)
Dependencies: None
```

---

## 2. Memory

The `Memory` block defines the system's state, data structures, and domain models. This maps directly to database schemas, class definitions, `structs`, or global state layers depending on the `Context`.

### Elements
*   **Entities**: The primary data objects.
*   **Fields**: The properties of an entity, including their semantic types (e.g., `String`, `Integer`, `Date`, `Boolean`).
*   **Relationships**: How entities connect (e.g., `One-to-Many`, `Has-a`).

### Rules
Properties should be defined descriptively. The compiler agent will translate natural language types ("a unique identifier", "a list of tags") into the optimal native types for the chosen stack (e.g., `uuid.UUID` or `[]string` in Go).

### Example
```prose
# Memory

## User Profile
- User ID: Unique identifier, immutable.
- Email: String, must be a valid email format, unique across the system.
- Created At: Timestamp, auto-generated on creation.
- Status: Enum (Active, Suspended, Deleted).

## Application Config
- Global variable representing the active server port (default: 8080).
```

---

## 3. Behaviors

The `Behaviors` block declares the precise business logic, algorithms, and rules of the system. This maps to core functions, services, and methods.

### Elements
*   **Workflows**: Step-by-step logic detailing how state (`Memory`) transitions occur.
*   **Constraints**: Validation rules and edge cases.
*   **Error Handling**: How the system reacts to failures.

### Rules
Behaviors must be specific enough to ensure deterministic code generation. Where algorithms require exact mathematical precision, the prose must dictate the exact approach rather than a vague summary. Behaviors should be testable. You can use standard logical constructs or explicitly adopt one of the [Supported Pseudocode Standards](#supported-pseudocode-standards) to guarantee precise interpretation.

### Example
```prose
# Behaviors

## User Registration
When a request is received to register a new user:
1. Validate the Email format. If invalid, throw a `400 Bad Request` error.
2. Check `Memory` if the Email already exists. If yes, throw a `409 Conflict`.
3. Generate a new User ID.
4. Set the `Status` to Active.
5. Save the `User Profile` to Memory.

## Password Hashing
- **CRITICAL**: Passwords must never be stored in plaintext. Generate a bcrypt hash with a cost factor of 12 before saving.
```

---

## 4. Interface

The `Interface` block defines how the external world (users, other systems, or other modules) interacts with the `Behaviors` and `Memory`. This maps to HTTP endpoints, CLI arguments, gRPC definitions, or UI views.

### Elements
*   **Endpoints**: For web services (Method, Path, Request Body, Response).
*   **Commands**: For CLI apps (Flags, Arguments).
*   **Views**: For UI apps (Screens, Components, User Flows).

### Rules
The Interface block binds the external inputs to the internal `Behaviors`. Every interface definition must specify which behavior it triggers.

### Example
```prose
# Interface

## REST API
**POST /api/v1/register**
- Accepts JSON matching the `User Profile` (excluding ID and Created At).
- Triggers the `User Registration` behavior.
- On success, returns `201 Created` with the generated User ID.
- On failure, returns appropriate error codes.

## CLI Command (If compiled as a tool)
**Command**: `myapp register --email [value] --password [value]`
- Triggers the `User Registration` behavior immediately.
- Prints "Success" to `stdout` or error reasons to `stderr`.
```

---

## 5. Tests

The `Tests` block defines the specific rules and expectations used to validate that the implementation matches the `Behaviors`. This maps directly to Unit, Integration, and End-to-End (E2E) testing suites. 

### Elements
*   **Test Cases**: Declarative scenarios outlining inputs and expected reactions.
*   **Parity Commands**: Exact commands or parameters needed to run tests (e.g., `go test ./...`).

### Rules
Every single behavior listed in the `Behaviors` section MUST have one or more explicit tests defined in this block. If the compiler agent detects missing tests during `generate`, `build`, or `test` workflows, it will throw an error and ask for explicit user permission to bypass the check. When reverse-engineering an existing codebase, this section is auto-populated with the legacy test suite to ensure functional parity. Test cases may also use the [Supported Pseudocode Standards](#supported-pseudocode-standards) to describe setup and assertions.

### Example
```prose
# Tests

## User Registration Tests
1. **Valid Registration**: Send a POST to `/api/v1/register` with a valid email. Expect `201 Created` and the DB to contain the new profile.
2. **Invalid Email**: Send a POST with "bademail". Expect `400 Bad Request`.
3. **Duplicate Email**: Register "test@test.com", then register it again. Expect `409 Conflict`.

## Run Command
`npm run test -- --grep "User Registration"`
```

---

## Supported Pseudocode Standards

Prose-Lang naturally supports several specific pseudocode standards within the `Behaviors` and `Tests` sections to ensure algorithmic clarity.

### A. The Cambridge Standard (Foundational Logic)
* **Reference:** Cambridge IGCSE Computer Science Syllabus 0478.
* **Application:** Use this to interpret assignments, conditionals, and basic I/O.
  * Treat `←` or words like `SET` and `STORE` as strict variable assignments.
  * Recognize capitalized control words: `IF`, `THEN`, `ELSE`, `INPUT`, `OUTPUT` as absolute control flow boundaries.

### B. The AP CSP Standard (Modern Iteration & Lists)
* **Reference:** AP Computer Science Principles Exam Reference Sheet.
* **Application:** Use this to interpret loops, array manipulation, and highly readable English syntax.
  * Accurately translate human-readable loops like `REPEAT n TIMES`, `REPEAT UNTIL (condition)`, and `FOR EACH item IN list` into the target language's most idiomatic looping constructs.
  * Map natural language list commands (`INSERT`, `APPEND`, `DISPLAY`) directly to native array/slice/list methods.

### C. The Academic Standard: CLRS (Complex Algorithms & Scope)
* **Reference:** *Introduction to Algorithms* (Cormen, Leiserson, Rivest, Stein).
* **Application:** Use this to manage scope, nested logic, and references.
  * **Scope via Indentation:** Assume block structures (loops, conditionals, functions) are defined entirely by indentation. When indentation returns to the parent margin, the block is closed.
  * **By-Reference Variables:** Treat complex objects defined in the `Memory` section as being passed by reference through the algorithms.

---

## Strict Mode (`@prose_strict_block`)

While Prose is generally declarative, there are instances where algorithms must be implemented identically to a specified pattern. The `@prose_strict_block` annotation forces the compiler agent to abandon interpretation and strictly adhere to the provided logic.

When a snippet of code or pseudo-code is wrapped in this annotation, the AI agent must exactly follow that logic, or drop-in replace it if the actual code snippet is copied over directly.

Note: When reverse-engineering or analyzing code, compiler agents must default to algorithmic pseudocode standard translation. They must ask for and receive explicit user approval before using `@prose_strict_block`.

### Example
```prose
# Behaviors

## Calculate Trigonometry
To calculate the sine value, do NOT use the standard math library. Use the Taylor series:

@prose_strict_block
func floatSin(x *big.Float) *big.Float {
    // Exact implementation here...
}
@prose_strict_block
```

---

## Composition and Linking

Large codebases should not exist in a single `.prose` file. Applications must be broken down by domain into multiple files. 
Files can link to each other conceptually if they share a directory context. The compiler agent understands directory structures and will compile inter-dependent `.prose` files into coordinated multi-package source code.