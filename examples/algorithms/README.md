# Algorithms & Data Structures in Prose-Lang

This directory contains an extensive technical exercise proving the viability of **Prose-Lang** as a universal, cross-language algorithmic specification language. 

We performed a deep reverse-engineering of complex, real-world sorting algorithms originally written in Go, translated them into plain-English `.prose` specifications (using AP CSP / CLRS standards), and used the Prose-Lang compiler (`prose generate`) to synthetically generate them back into both **Go** and **Rust**.

## 1. The Sorting Algorithms Exercise

We started with 26 complex sorting algorithms (`examples/algorithms/sort`) originally spread across 26 fragmented legacy Go files, complete with varied stylistic approaches and tightly coupled legacy dependencies.

### Step 1: Reverse Engineering to Prose
We read the raw source code and translated the *pure mathematical essence* of every algorithm into 4 strictly organized `.prose` specification files located in `examples/algorithms/sort/src/`:
- `basic_sorts.prose` (Insertion, Selection, Bubble, etc.)
- `advanced_sorts.prose` (Quicksort, Merge, Heap, Timsort, Shell)
- `distribution_sorts.prose` (Counting, Radix, Bucket, Pigeonhole)
- `esoteric_sorts.prose` (Bogo, Cycle, Pancake, Stooge, etc.)

By abstracting away language-specific syntax, the business logic became a universal source of truth.

### Step 2: The Go Code Generation & Testing
We ran `prose generate` targeting Go. The AI compiler ingested the 4 `.prose` files and output 4 highly cohesive, standardized `.go` files. We ported the original immense 8-scenario test suite (`sorts_test.go`) from the legacy code into the new, generated module.

**Results:**
The generated Go code successfully compiled and achieved **100% functional parity**. Every single algorithm passed all rigorous test scenarios (Empty slice, Singletons, Reversed Signed arrays, Negatives, Alternating Odd/Evens).

### Step 3: Cross-Language Compilation to Rust
The true test of Prose-Lang is language agnosticism. We took the exact same algorithmic pseudo-code blocks in the 4 `.prose` files and simply changed the headers:
```yaml
Stack: rust-lang
```
We updated the `Interface` section from Go generics (`[]T`) to Rust mutable slice references (`&mut [T]`). 

We ran `prose generate` again. The compiler generated a complete, idiomatic Rust Cargo project (`Cargo.toml`, `src/lib.rs`, `src/*_sorts.rs`, `tests/sort_tests.rs`).

**Results:**
```bash
     Running tests/sort_tests.rs (target/debug/deps/sort_tests-ebdd91e8aa77be44)

running 26 tests
test test_bucket ... ok
test test_bubble ... ok
test test_circle ... ok
test test_cocktail ... ok
test test_count ... ok
test test_comb ... ok
test test_bogo ... ok
...
test test_timsort ... ok
test test_stooge ... ok

test result: ok. 26 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```
**100% Functional Parity.** The exact same mathematical pseudo-code successfully bridged the gap from Go's garbage-collected memory model to Rust's strict borrow-checker semantics, passing all scenarios flawlessly.

---

**Conclusion:** 
Prose-Lang is a tremendously powerful tool for high-level business logic, data models, and self-contained mathematical algorithms, successfully acting as an irrefutable source of truth across language boundaries.


> **Credit & Attribution:** All of the sorting algorithms implemented in this example (both the legacy Go codebase we reverse engineered from, and the mathematically equivalent test suites) were originally sourced from the fantastic, MIT-licensed [TheAlgorithms/Go](https://github.com/TheAlgorithms/Go) repository. This directory serves as a demonstration of abstracting those implementations into language-agnostic Prose-Lang specifications.