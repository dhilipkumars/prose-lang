# Prose-Lang Examples

This directory contains standalone example applications built entirely via `prose-lang` specifications (`.prose` files). They demonstrate the capabilities of natural language-driven development across different technology stacks and architectural patterns.

## Available Examples

| Example | Complexity | Tech Stack | Description |
|---|---|---|---|
| [**hello-world-cli**](hello-world-cli/) | Basic | Go | Two minimal CLI apps demonstrating simple text outputs (`Hello` and `Namaste`). |
| [**calc**](calc/) | Basic | React (SPA) | A single-page Devanagari calculator application compiled from a single `.prose` file. |
| [**hello-world-micro-service**](hello-world-micro-service/) | Intermediate | Go / TypeScript | A basic REST API demonstrating the same `.prose` spec compiled into two different backend languages. |
| [**full-stack**](full-stack/) | Advanced | React, Rust, PostgreSQL, Docker | A complete "Book Library" application featuring a DB, an Actix API backend, and a Frontend UI. |
| [**micro-service**](micro-service/) | Advanced | React, Java (Spring), PostgreSQL, Docker | A more complex Container/Product Management system spanning multiple bounded-context Java backends and an integrated proxy UI. |

## Running the Examples

Each directory contains a `generated/` folder containing the compiled source code, alongside a `README.md` detailing how to run it. Most complex examples (like `full-stack` and `micro-service`) use `docker compose up --build -d` to orchestrate their environments.
