# Prose-Lang Specification

This directory defines the core concepts and agent skills that power the `prose-lang` compiler chain. The compiler uses a declarative `.prose` file to generate executable code.

## The `.prose` File Anatomy

A standard `.prose` specification is organized into four main sections. These sections map directly to how an AI agent understands and architects software:

### 1. `Context`
Defines the **environment and architecture**.
* **What it implies**: Tells the compiler *what* we are building (e.g., CLI, Web Service, React Frontend) and the *technology stack* to use (e.g., Go, Python, Java). 
* **Example**:
  ```markdown
  Type: Command Line app (CLI)
  Stack: Go
  ```

### 2. `Memory`
Defines the **data structures and state**.
* **What it implies**: Maps to Database Schemas, In-Memory Structs/Classes, or state management structures. This is where you declare the entities the application cares about and their relationships.
* **Example**:
  ```markdown
  container_table (container_id, container_name, product_id, quantity)
  ```

### 3. `Behaviors`
Defines the **core business logic and functional requirements**.
* **What it implies**: Maps to Services, Handlers, Controllers, or CLI execution paths. These are step-by-step prose instructions that the AI compiles into executable algorithms.
* **Example**:
  ```markdown
  1. Receive HTTP request with a 'name' parameter.
  2. If 'name' is missing, default to 'World'.
  3. Return JSON: {"message": "Hello {name}"}
  ```

### 4. `Interface`
Defines the **entry points and boundaries**.
* **What it implies**: Maps to API Routes (REST/GraphQL endpoints), CLI command flags, or UI views. It defines how a human or another system interacts with the `Behaviors`.
* **Example**:
  ```markdown
  - GET /api/containers (List all containers with pagination)
  - POST /api/containers
  ```

---

## Agent Skills (`specification.md`)

The AI agents that compile `.prose` files are equipped with specific "skills" (defined in `specification.md`). These map to the CLI commands you run:

* **`prose.generate`**: Reads the Context, Memory, Behaviors, and Interface to write the actual `.go`, `.py`, or `.js` source code.
* **`prose.build`**: Executes native build tools (like `go build`, `npm run build`, or `docker build`) to compile the generated source into deployable artifacts.
* **`prose.test`**: Automatically asserts that the generated `Behaviors` actually produce the expected results.
* **`prose.document`**: Auto-generates human-readable `README.md` or API references from the `.prose` source.
* **`prose.publish`**: Handles version bumping and pushing artifacts to a registry.