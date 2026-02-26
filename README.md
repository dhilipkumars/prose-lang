# prose-lang

> [!WARNING]
> **Experimental Project**
> `prose-lang` is currently an experimental research project exploring AI-driven compilation. **It should NOT be used in production environments.**

A declarative language for describing applications in natural prose that AI agents compile to source code.

![Prose-Lang CLI Demo](hello-world-demo.gif)

## How It Works (The Agent Skill Model)

Unlike traditional programming languages that use syntax-tree compilers, **`prose-lang` uses an LLM Agent as its compiler.**

You do not run a traditional binary to build your app. Instead, you interact with your AI IDE (like GitHub Copilot, Cursor, or Gemini) equipped with the Prose-Lang Agent Skill:

1. **Write Specs:** You author `.prose` files detailing memory, layout, and behaviors, and save them in a `src/` directory.
2. **Invoke the Skill:** You command your AI agent to `prose.generate src/`.
3. **The AI Compiles:** Guided by the strict instructions in the installed `SKILL.md` file, the AI reads your prose specifications and maps them into real source code inside a `generated/` directory.

## Example

```prose
# Context
Type: Command Line app (CLI)
Stack: Go

# Memory
NONE

# Behaviors
1. Say 'Hello World'

# Interface
NONE
```

## Top 5 Benefits of Using Prose-Lang Today

In the era of AI-assisted engineering and "vibe coding," `prose-lang` acts as the architectural anchor that keeps your projects scalable and maintainable.

1. **Architecture First, Zero Spaghetti:** Vibe coding often leads to tangled state and inconsistent abstractions as the AI organically patches code. Prose-lang enforces a strict top-down architecture (Memory, Behaviors, Interface) *before* generation, ensuring clean domain models and clear boundaries.
2. **Infinite Context Memory:** LLMs have finite context windows and start hallucinating as codebases grow beyond a few thousand lines. A `.prose` file acts as heavily compressed memory. You can hand a `.prose` file to an AI months later, and it will instantly understand your exact business rules without needing to read 100 source files.
3. **The Ultimate AI "Reset Button":** When a long AI chat session gets confused and starts introducing regressions, you don't have to start over from scratch. You can start a fresh chat, attach your `.prose` file, and say, "We are taking over a project matching this spec." The AI instantly aligns to the domain architecture perfectly.
4. **Language & Vendor Agnosticism:** Your core business logic is abstracted entirely away from the syntax. If you decide to port your backend from Python to Go, or swap out React for Vue, the `.prose` file makes it trivial. The logic survives the rewrite.
5. **Instant Auditing & Human Readability:** Reviewing a 100-line Markdown specification for business logic flaws, edge cases, or security holes is infinitely faster and more reliable than reviewing 2,000 lines of generated, syntax-heavy source code. It bridges the gap between software engineers and product managers.

## Installation

Requires [uv](https://docs.astral.sh/uv/) and Python 3.8+.

The recommended way to install `prose-lang` is via the pre-built release on GitHub. This CLI tool **installs the agent skill instructions** into your repository so your LLM knows how to compile prose.

```bash
# Install the latest release directly via URL
uv tool install https://github.com/dhilipkumars/prose-lang/releases/download/v0.0.1-alpha/prose_install-0.0.1a0-py3-none-any.whl
```

Alternatively, to build from source:
```bash
git clone https://github.com/dhilipkumars/prose-lang.git
cd prose-lang
uv tool install .
```

```bash
# Install the skill instructions into the current project directory
prose-install --scope local --agent gemini

# Install globally (into ~/)
prose-install --scope global --agent claude
```

## Examples

See the [`examples/`](examples) directory for sample `.prose` files demonstrating various application types, including CLI tools, full-stack web apps, and microservices. Note how the specs live in `src/` and output to `generated/`.

## Interactions (Agent Commands)

Once the skill is installed, simply chat with your AI and ask it to execute the following workflows:

| Workflow | Ask your AI to... |
|---------|-------------|
| `prose.generate` | Read `src/*.prose` and compile it into source code in `generated/` |
| `prose.build` | Build the generated code into deployable artifacts |
| `prose.test` | Generate tests and validate implementation against the spec |
| `prose.document` | Generate project documentation from a `.prose` file |
| `prose.publish` | Version, tag, and release the project |
| `prose.reverse-engineer` | Read an existing codebase and write a comprehensive `.prose` specification covering its architecture |

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details on how to get started, run tests, and submit Pull Requests.

## Supported Agents

| Agent         | Skills Path                                         |
|---------------|-----------------------------------------------------|
| `gemini`      | `.gemini/skills/prose-lang/SKILL.md`                |
| `claude`      | `.claude/skills/prose-lang/SKILL.md`                |
| `copilot`     | `.github/instructions/prose-lang/SKILL.md`          |
| `codex`       | `.codex/skills/prose-lang/SKILL.md`                 |
| `antigravity` | `.agent/skills/prose-lang/SKILL.md`                 |

## Upgrading

```bash
uv tool install . --force --reinstall
```

## License

[MIT](LICENSE)

## Roadmap

* **Spec Kit Integration**: Fully test and support seamless integration as an extension for GitHub's [Spec Kit](https://github.com/github/spec-kit).
  ```bash
  # Future flow
  specify init my-project --ai gemini --ai-skills
  ```