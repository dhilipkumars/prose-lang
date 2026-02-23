# Contributing to prose-lang

First off, thank you for considering contributing to `prose-lang`! People like you make this tool better for everyone.

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally: `git clone https://github.com/your-username/prose-lang.git`
3. Install the dependencies and the CLI locally using `uv`:
   ```bash
   uv tool install .
   ```

## Development Workflow

- The core scripts are located in `installer/` and `spec/scripts/`.
- AI Agent skills are located in `spec/skills-template/`.
- Test sample applications are located in `examples/`.

If you are modifying the behavior of how `prose-lang` compiles files, you likely need to update the AI prompt templates in `spec/skills-template/prose-lang/SKILL.md`.

## Running Tests

We use `pytest` for unit testing the installer and the synchronization scripts.

```bash
uv pip install pytest
pytest tests/
```

Make sure all tests pass before submitting your Pull Request!

## Submitting a Pull Request

1. Create a new branch: `git checkout -b my-feature-branch`
2. Make your changes and commit them with a clear, descriptive message.
3. Push to your fork and submit a Pull Request to the `main` branch.
4. Ensure the CI pipeline passes.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).
