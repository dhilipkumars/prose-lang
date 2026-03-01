#!/usr/bin/env bash
#
# Test script for AKS Primality Test — Cross-Language Parity
#
# Tests:
#   1. Print first 100 prime numbers — all 3 languages must agree
#   2. Print first 100 composite numbers — all 3 languages must agree
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GEN_DIR="$PROJECT_DIR/generated/PRIMES_is_in_P"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0

pass() { PASS=$((PASS + 1)); }
fail() { FAIL=$((FAIL + 1)); echo -e "  ${RED}✗ FAIL${NC}: $1"; }

# ─── Build Phase ─────────────────────────────────────────────────────────────

echo -e "${YELLOW}═══ Building all implementations ═══${NC}"

echo "  Building Go..."
(cd "$GEN_DIR/go" && go build -o "$GEN_DIR/go/aks_test" .)
echo -e "  ${GREEN}Go built.${NC}"

echo "  Building Rust..."
(cd "$GEN_DIR/rust" && cargo build --release --quiet 2>&1)
echo -e "  ${GREEN}Rust built.${NC}"

HAVE_JAVA=false
if command -v javac &>/dev/null && command -v java &>/dev/null; then
    # Verify java actually works (macOS stub may exist but fail)
    if java --version &>/dev/null 2>&1; then
        echo "  Building Java..."
        (cd "$GEN_DIR/java" && javac AKSPrimalityTest.java)
        echo -e "  ${GREEN}Java built.${NC}"
        HAVE_JAVA=true
    else
        echo -e "  ${YELLOW}⚠ Java runtime unavailable — skipping Java tests${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠ Java not found — skipping Java tests${NC}"
fi

GO_BIN="$GEN_DIR/go/aks_test"
RUST_BIN="$GEN_DIR/rust/target/release/primes_is_in_p"
JAVA_CMD="java -cp $GEN_DIR/java AKSPrimalityTest"

# ─── Helper: test a single number across all 3 languages ────────────────────

test_number() {
    local n=$1
    local expected=$2

    local go_out=$("$GO_BIN" "$n")
    local rust_out=$("$RUST_BIN" "$n")
    local java_out=$($JAVA_CMD "$n")

    if [[ "$go_out" == "$expected" && "$rust_out" == "$expected" && "$java_out" == "$expected" ]]; then
        pass
    else
        fail "n=$n expected=$expected go=$go_out rust=$rust_out java=$java_out"
    fi
}

# ─── Test 1: First 100 primes ───────────────────────────────────────────────

echo ""
echo -e "${YELLOW}═══ Test 1: First 100 prime numbers ═══${NC}"

PRIME_COUNT=0
PRIMES=""
n=2

while [[ $PRIME_COUNT -lt 100 ]]; do
    go_out=$("$GO_BIN" "$n")
    if [[ "$go_out" == "true" ]]; then
        # Verify all languages agree
        rust_out=$("$RUST_BIN" "$n")
        match=true
        if [[ "$rust_out" != "true" ]]; then match=false; fi

        if [[ "$HAVE_JAVA" == "true" ]]; then
            java_out=$($JAVA_CMD "$n")
            if [[ "$java_out" != "true" ]]; then match=false; fi
        fi

        if [[ "$match" == "true" ]]; then
            pass
            PRIMES="$PRIMES $n"
            PRIME_COUNT=$((PRIME_COUNT + 1))
        else
            fail "n=$n: Go=$go_out Rust=$rust_out${HAVE_JAVA:+ Java=$java_out}"
            PRIME_COUNT=$((PRIME_COUNT + 1))
        fi
    fi
    n=$((n + 1))
    if (( n % 50 == 0 )); then
        echo -ne "  ${CYAN}Scanning n=$n (found $PRIME_COUNT primes so far)${NC}\r"
    fi
done
echo -ne "\n"
echo -e "  ${GREEN}Found 100 primes. Last 10:${NC}"
echo "   $(echo $PRIMES | tr ' ' '\n' | tail -10 | tr '\n' ' ')"

# ─── Test 2: First 100 composites ───────────────────────────────────────────

echo ""
echo -e "${YELLOW}═══ Test 2: First 100 composite numbers ═══${NC}"

COMP_COUNT=0
COMPOSITES=""
n=4

while [[ $COMP_COUNT -lt 100 ]]; do
    go_out=$("$GO_BIN" "$n")
    if [[ "$go_out" == "false" && $n -ge 2 ]]; then
        # Verify all languages agree
        rust_out=$("$RUST_BIN" "$n")
        match=true
        if [[ "$rust_out" != "false" ]]; then match=false; fi

        if [[ "$HAVE_JAVA" == "true" ]]; then
            java_out=$($JAVA_CMD "$n")
            if [[ "$java_out" != "false" ]]; then match=false; fi
        fi

        if [[ "$match" == "true" ]]; then
            pass
            COMPOSITES="$COMPOSITES $n"
            COMP_COUNT=$((COMP_COUNT + 1))
        else
            fail "n=$n: Go=$go_out Rust=$rust_out${HAVE_JAVA:+ Java=$java_out}"
            COMP_COUNT=$((COMP_COUNT + 1))
        fi
    fi
    n=$((n + 1))
    if (( n % 50 == 0 )); then
        echo -ne "  ${CYAN}Scanning n=$n (found $COMP_COUNT composites so far)${NC}\r"
    fi
done
echo -ne "\n"
echo -e "  ${GREEN}Found 100 composites. Last 10:${NC}"
echo "   $(echo $COMPOSITES | tr ' ' '\n' | tail -10 | tr '\n' ' ')"

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
