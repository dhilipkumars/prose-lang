# prose-lang

A declarative language for describing applications in natural prose that AI agents compile to source code.

https://github.com/dhilipkumars/prose-lang/raw/main/hello-world-demo.mov

Write a `.prose` file → invoke the compiler → the AI agent generates the target code.

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

## Installation

Requires [uv](https://docs.astral.sh/uv/) and Python 3.8+.

The recommended way to install `prose-lang` is via the pre-built release on GitHub.

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
# Install into the current project directory
prose-install --scope local --agent gemini

# Install globally (into ~/)
prose-install --scope global --agent claude
```

## Examples

See the [`examples/`](examples) directory for sample `.prose` files demonstrating various application types, including CLI tools, full-stack web apps, and microservices.

## Commands

| Command | Description |
|---------|-------------|
| `prose.generate` | Compile a `.prose` file into source code |
| `prose.build` | Build generated code into deployable artifacts |
| `prose.test` | Validate implementation against the spec |
| `prose.document` | Generate documentation from a `.prose` file |
| `prose.publish` | Version, tag, and release the project |

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