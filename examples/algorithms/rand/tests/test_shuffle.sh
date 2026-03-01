#!/usr/bin/env bash
#
# Test script for Knuth Random Shuffle — Cross-Language Parity
#
# Each iteration chains its output as input to the next:
#   NEXT_INPUT = Shuffle(INPUT)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GEN_DIR="$PROJECT_DIR/generated/knuth_random_shuffle"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

pass() { PASS=$((PASS + 1)); echo -e "  ${GREEN}✓ PASS${NC}: $1"; }
fail() { FAIL=$((FAIL + 1)); echo -e "  ${RED}✗ FAIL${NC}: $1"; }

# ─── Build Phase ─────────────────────────────────────────────────────────────

echo -e "${YELLOW}═══ Building all implementations ═══${NC}"

echo "  Building Go..."
(cd "$GEN_DIR/go" && go build -o "$GEN_DIR/go/knuth_shuffle" .)
echo -e "  ${GREEN}Go built.${NC}"

echo "  Building Rust..."
(cd "$GEN_DIR/rust" && cargo build --release --quiet 2>&1)
echo -e "  ${GREEN}Rust built.${NC}"

echo -e "  ${GREEN}Python needs no build.${NC}"

GO_BIN="$GEN_DIR/go/knuth_shuffle"
RUST_BIN="$GEN_DIR/rust/target/release/knuth_random_shuffle"
PY_BIN="python3 $GEN_DIR/python/knuth_random_shuffle.py"

# ─── Test 1: RAND_SEED=100, input 1..10, shuffle 3 times (chained) ──────────

echo ""
echo -e "${YELLOW}═══ Test 1: RAND_SEED=100, input=1..10, 3 chained shuffles ═══${NC}"

export RAND_SEED=100

go_input="1,2,3,4,5,6,7,8,9,10"
rust_input="1,2,3,4,5,6,7,8,9,10"
py_input="1,2,3,4,5,6,7,8,9,10"

for run in 1 2 3; do
    go_out=$(   "$GO_BIN"  "$go_input")
    rust_out=$( "$RUST_BIN" "$rust_input")
    py_out=$(   $PY_BIN    "$py_input")

    if [[ "$go_out" == "$rust_out" && "$rust_out" == "$py_out" ]]; then
        pass "Run $run — all match: $go_out (input was: $go_input)"
    else
        fail "Run $run — mismatch!"
        echo "       Go:     $go_out"
        echo "       Rust:   $rust_out"
        echo "       Python: $py_out"
    fi

    # Chain: NEXT_INPUT = Shuffle(INPUT)
    go_input="$go_out"
    rust_input="$rust_out"
    py_input="$py_out"
done

# ─── Test 2: RAND_SEED=2001, 100-element array, 10 chained shuffles ─────────

echo ""
echo -e "${YELLOW}═══ Test 2: RAND_SEED=2001, 100 elements, 10 chained shuffles ═══${NC}"

export RAND_SEED=2001

# Generate a deterministic 100-element array (1..100, no trailing comma)
go_input=$(seq 1 100 | paste -sd, -)
rust_input="$go_input"
py_input="$go_input"

for run in $(seq 1 10); do
    go_out=$(   "$GO_BIN"  "$go_input")
    rust_out=$( "$RUST_BIN" "$rust_input")
    py_out=$(   $PY_BIN    "$py_input")

    if [[ "$go_out" == "$rust_out" && "$rust_out" == "$py_out" ]]; then
        pass "Run $run — all 3 languages match"
    else
        fail "Run $run — mismatch!"
        echo "       Go:     ${go_out:0:80}..."
        echo "       Rust:   ${rust_out:0:80}..."
        echo "       Python: ${py_out:0:80}..."
    fi

    # Chain: NEXT_INPUT = Shuffle(INPUT)
    go_input="$go_out"
    rust_input="$rust_out"
    py_input="$py_out"
done

# ─── Summary ─────────────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}═══ Summary ═══${NC}"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"

if [[ $FAIL -gt 0 ]]; then
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
