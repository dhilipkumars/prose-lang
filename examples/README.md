# Prose-Lang Examples

This directory contains standalone example applications built entirely via `prose-lang` specifications (`.prose` files). They demonstrate the capabilities of natural language-driven development across different technology stacks and architectural patterns.

## Available Examples

---

<details open>
<summary><strong>🔤 hello-world-cli</strong> — <em>Basic | Go</em></summary>

Two minimal CLI apps demonstrating simple text outputs (`Hello` and `Namaste`).  
**Compiled From:** `hello.prose`, `namaste.prose`

```bash
cd hello-world-cli/generated/hello
go run .
```

📂 [hello-world-cli/](hello-world-cli/)

</details>

---

<details open>
<summary><strong>🧮 calc</strong> — <em>Basic | React (SPA)</em></summary>

A single-page Devanagari/Mandarin calculator application compiled from a single `.prose` file. Accepts standard numerical input but displays numerals in Mandarin script.

**Compiled From:** `src/calc.prose`

```bash
cd calc/generated/calc
npm install && npm run dev
```

📂 [calc/](calc/)

</details>

---

<details open>
<summary><strong>🌐 hello-world-micro-service</strong> — <em>Intermediate | Go / TypeScript</em></summary>

A basic REST API demonstrating the same `.prose` spec compiled into two different backend languages. Greets users with "Vanakam" and handles name formatting logic.

**Compiled From:** `.prose` specs  
**Stacks:** Go, TypeScript

📂 [hello-world-micro-service/](hello-world-micro-service/)

</details>

---

<details open>
<summary><strong>📚 full-stack</strong> — <em>Advanced | React, Rust, PostgreSQL, Docker</em></summary>

A complete three-tier "Book Library" application featuring user authentication, a PostgreSQL database, a Rust (Actix-Web) backend API, and a React frontend UI.

**Compiled From:** `src/full-stack.prose`

```bash
cd full-stack/generated
docker compose up --build -d
```

📂 [full-stack/](full-stack/)

</details>

---

<details open>
<summary><strong>🐳 micro-service</strong> — <em>Advanced | React, Java (Spring), PostgreSQL, Docker</em></summary>

A multi-container microservice architecture with two independent Java Spring Boot backends (`m1` for Container Management, `m2` for Product Management), each with their own PostgreSQL database, and a single React frontend proxying requests to both.

**Compiled From:** `src/m1.prose`, `src/m2.prose`, `src/ui.prose`

```bash
cd micro-service/generated
docker compose up --build -d
```

📂 [micro-service/](micro-service/)

</details>

---

<details open>
<summary><strong>🔢 algorithms/sort</strong> — <em>Advanced | Rust</em></summary>

26 sorting algorithms reverse-engineered from Go into `.prose` specifications using AP CSP / CLRS pseudocode standards, then re-generated into idiomatic Rust. 100% functional parity across all 26 algorithms and 8 test scenarios.

**Compiled From:** `sort/src/basic_sorts.prose`, `advanced_sorts.prose`, `distribution_sorts.prose`, `esoteric_sorts.prose`

```bash
cd algorithms/sort/generated/sort
cargo test
```

Algorithms include: Insertion, Selection, Bubble, Shell, Quicksort, Merge, Heap, Timsort, Radix, Counting, Bucket, Bogo, Pancake, Stooge, and more.

📂 [algorithms/sort/](algorithms/sort/) · 📄 [README](algorithms/README.md)

</details>

---

<details open>
<summary><strong>🔀 algorithms/rand</strong> — <em>Intermediate | Go, Rust, Python</em></summary>

Knuth (Fisher-Yates) Random Shuffle implemented across 3 languages with a shared LCG PRNG (`a=1103515245, c=12345, m=2³¹`) for deterministic cross-language parity.

**Compiled From:** `rand/src/knuth_random_shuffle.prose`

```bash
cd algorithms/rand
bash tests/test_shuffle.sh       # parity tests
bash tests/benchmark_shuffle.sh  # 100K × 1000 benchmark
```

| Lang | Avg Time (100K shuffle) | Memory |
|------|------------------------|--------|
| Go | 0.0001s | 9.9 MB |
| Rust | 0.0002s | 9.9 MB |
| Python | 0.0507s | 39.5 MB |

📂 [algorithms/rand/](algorithms/rand/) · 📄 [README](algorithms/rand/README.md)

</details>

---

<details open>
<summary><strong>🔐 algorithms/prime</strong> — <em>Advanced | Go, Rust, Java</em></summary>

AKS Primality Test ("PRIMES is in P") — the first deterministic polynomial-time primality proving algorithm. Implements the full algorithm with polynomial modular arithmetic.

**Compiled From:** `prime/PRIMES_is_in_P/src/PRIMES_is_in_P.prose`

```bash
cd algorithms/prime/PRIMES_is_in_P
bash tests/test_aks.sh          # 200 parity tests
bash tests/benchmark_aks.sh     # top 100 primes below 1M
```

| Lang | Top-100-primes-below-1M | Avg/Number |
|------|------------------------|------------|
| Go | 180s | 0.248s |
| Rust | 179s | 0.246s |
| Java | 4,927s | 6.795s |

📂 [algorithms/prime/](algorithms/prime/) · 📄 [README](algorithms/prime/PRIMES_is_in_P/README.md)

</details>

---

<details>
<summary><strong>🍎 ivy</strong> — <em>Experimental | Reverse Engineering</em></summary>

An experimental reverse-engineering exercise on Rob Pike's [Ivy](https://pkg.go.dev/robpike.io/ivy) APL-like interpreter. The original Go codebase was analyzed and decomposed into `.prose` specifications to test Prose-Lang's ability to capture complex, low-level interpreter logic.

📂 [ivy/](ivy/)

</details>

---

## Running the Examples

Each directory contains a `generated/` folder with the compiled source code and a `README.md` with run instructions. Complex examples (`full-stack`, `micro-service`) use `docker compose up --build -d`.
