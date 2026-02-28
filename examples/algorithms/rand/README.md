# Knuth Random Shuffle

A cross-language implementation of the **Fisher-Yates (Knuth) Shuffle Algorithm** in Go, Rust, and Python — with deterministic output parity across all three languages.

> Built with [prose-lang](https://github.com/dhilipkumars/prose-lang). See the [specification](src/knuth_random_shuffle.prose) for the full design.

## How It Works

The algorithm performs an in-place shuffle using a **Linear Congruential Generator (LCG)** with glibc constants, ensuring identical random sequences across all three languages for any given seed.

```
LCG Parameters:
  a = 1103515245
  c = 12345
  m = 2^31 (2147483648)

Shuffle:
  FOR i FROM n-1 DOWN TO 1:
    j = lcg_next() mod (i + 1)
    SWAP arr[i], arr[j]
```

Seeding is controlled via the `RAND_SEED` environment variable. If unset, the current Unix timestamp is used.

## Project Structure

```
rand/
├── src/
│   └── knuth_random_shuffle.prose   # Prose specification (source of truth)
├── generated/
│   └── knuth_random_shuffle/
│       ├── go/                      # Go implementation
│       │   ├── go.mod
│       │   └── main.go
│       ├── rust/                    # Rust implementation
│       │   ├── Cargo.toml
│       │   └── src/main.rs
│       └── python/                  # Python implementation
│           └── knuth_random_shuffle.py
└── tests/
    ├── test_shuffle.sh              # Cross-language parity tests
    └── benchmark_shuffle.sh         # Performance benchmarks
```

## Prerequisites

| Tool | Version |
|------|---------|
| Go | 1.21+ |
| Rust (cargo) | 2021 edition+ |
| Python | 3.8+ |
| Bash | 4.0+ |

## Running

Each implementation is a standalone CLI that takes a comma-separated list of integers and prints the shuffled result.

### Go

```bash
cd generated/knuth_random_shuffle/go
go build -o knuth_shuffle .
RAND_SEED=42 ./knuth_shuffle "1,2,3,4,5,6,7,8,9,10"
```

### Rust

```bash
cd generated/knuth_random_shuffle/rust
cargo build --release
RAND_SEED=42 ./target/release/knuth_random_shuffle "1,2,3,4,5,6,7,8,9,10"
```

### Python

```bash
RAND_SEED=42 python3 generated/knuth_random_shuffle/python/knuth_random_shuffle.py "1,2,3,4,5,6,7,8,9,10"
```

> All three commands above produce **identical output** for the same `RAND_SEED`.

## Testing

The test script builds all three implementations and verifies cross-language output parity.

```bash
bash tests/test_shuffle.sh
```

### What it tests

| Test | Seed | Input | Runs | Assertion |
|------|------|-------|------|-----------|
| **Test 1** | `RAND_SEED=100` | `1,2,3,4,5,6,7,8,9,10` | 3 | Go = Rust = Python for each run |
| **Test 2** | `RAND_SEED=2001` | `1..100` (100 elements) | 10 | Go = Rust = Python for each run |

### Test Results

```
═══ Test 1: RAND_SEED=100, input=1..10, 3 shuffles ═══
  ✓ PASS: Run 1 — all match: 5,3,7,10,9,2,6,4,1,8
  ✓ PASS: Run 2 — all match: 5,3,7,10,9,2,6,4,1,8
  ✓ PASS: Run 3 — all match: 5,3,7,10,9,2,6,4,1,8

═══ Test 2: RAND_SEED=2001, 100 elements, 10 shuffles ═══
  ✓ PASS: Run 1–10 — all 3 languages match

  Passed: 13 | Failed: 0
  All tests passed!
```

## Benchmarking

The benchmark script measures wall-clock time and peak memory across 1,000 iterations on a 100,000-element array.

```bash
bash tests/benchmark_shuffle.sh
```

### Configuration

| Parameter | Value |
|-----------|-------|
| Array size | 100,000 integers |
| Iterations | 1,000 per language |
| RAND_SEED | Not set (uses current time) |
| Timing | `/usr/bin/time -l` (wall-clock + max RSS) |

### Benchmark Results

Measured on Apple Silicon (macOS):

| Language | Avg Time | σ Time | Avg Memory | σ Memory |
|----------|----------|--------|------------|----------|
| **Go** | **0.0001s** | 0.0029s | **9,899 KB** | 256 KB |
| **Rust** | **0.0002s** | 0.0051s | **9,948 KB** | 7 KB |
| **Python** | 0.0507s | 0.0067s | 39,455 KB | 186 KB |

### Key Takeaways

- **Go and Rust are ~250–500× faster** than Python for this workload.
- **Memory usage**: Go and Rust both use ~10 MB; Python requires ~39 MB (~4× more).
- **Rust has the most consistent memory** footprint (σ = 7 KB vs Go's 256 KB).
- **All three produce identical output** for any given seed, proving the LCG achieves perfect cross-language parity.

## Algorithm Credit

The [Knuth Shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) (Fisher-Yates) is a classic O(n) in-place shuffling algorithm described in *The Art of Computer Programming, Vol. 2* by Donald Knuth.

## License

[MIT](../../LICENSE)
