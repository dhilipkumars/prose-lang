#!/usr/bin/env bash
#
# Benchmark: AKS Primality Test — Top 100 Primes Below 1,000,000 (Reverse Order)
#
# Per .prose spec:
#   - Calculate top 100 primes for 1000000 (in reverse order)
#   - Run for each language: Go, Rust, Java
#   - Report timing per language
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GEN_DIR="$PROJECT_DIR/generated/PRIMES_is_in_P"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

TARGET=1000000
PRIME_TARGET=100

# ─── Build Phase ─────────────────────────────────────────────────────────────

echo -e "${YELLOW}═══ Building all implementations ═══${NC}"

echo "  Building Go..."
(cd "$GEN_DIR/go" && go build -o "$GEN_DIR/go/aks_test" .)
echo -e "  ${GREEN}Go built.${NC}"

echo "  Building Rust..."
(cd "$GEN_DIR/rust" && cargo build --release --quiet 2>&1)
echo -e "  ${GREEN}Rust built.${NC}"

HAVE_JAVA=false
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home}"
export PATH="$JAVA_HOME/bin:$PATH"
if command -v javac &>/dev/null && java --version &>/dev/null 2>&1; then
    echo "  Building Java..."
    (cd "$GEN_DIR/java" && javac AKSPrimalityTest.java)
    echo -e "  ${GREEN}Java built.${NC}"
    HAVE_JAVA=true
else
    echo -e "  ${YELLOW}⚠ Java unavailable — skipping${NC}"
fi

GO_BIN="$GEN_DIR/go/aks_test"
RUST_BIN="$GEN_DIR/rust/target/release/primes_is_in_p"
JAVA_CMD="java -cp $GEN_DIR/java AKSPrimalityTest"

# ─── Benchmark Function ─────────────────────────────────────────────────────

benchmark_lang() {
    local LANG_NAME="$1"
    local CMD="$2"

    echo ""
    echo -e "${CYAN}─── ${BOLD}${LANG_NAME}${NC}${CYAN}: Top ${PRIME_TARGET} primes below ${TARGET} (reverse) ───${NC}"

    local PRIMES=()
    local n=$((TARGET - 1))
    local TESTED=0
    local START_TIME=$(date +%s)

    while [[ ${#PRIMES[@]} -lt $PRIME_TARGET && $n -ge 2 ]]; do
        result=$($CMD "$n")
        TESTED=$((TESTED + 1))

        if [[ "$result" == "true" ]]; then
            PRIMES+=("$n")
            if (( ${#PRIMES[@]} % 10 == 0 )); then
                local ELAPSED=$(( $(date +%s) - START_TIME ))
                echo -e "  ${GREEN}Found ${#PRIMES[@]}/${PRIME_TARGET} primes (tested $TESTED numbers, ${ELAPSED}s elapsed)${NC}"
            fi
        fi

        # Skip even numbers (except 2)
        if (( n > 2 && n % 2 == 0 )); then
            n=$((n - 1))
        else
            n=$((n - 2))
        fi
    done

    local END_TIME=$(date +%s)
    local TOTAL_TIME=$((END_TIME - START_TIME))
    local AVG_TIME
    if (( TESTED > 0 )); then
        AVG_TIME=$(echo "scale=3; $TOTAL_TIME / $TESTED" | bc)
    else
        AVG_TIME="N/A"
    fi

    echo ""
    echo -e "  ${BOLD}Results (${LANG_NAME}):${NC}"
    echo -e "  Total time:        ${TOTAL_TIME}s"
    echo -e "  Numbers tested:    ${TESTED}"
    echo -e "  Avg time/number:   ${AVG_TIME}s"
    echo -e "  Top 10 primes:     ${PRIMES[0]} ${PRIMES[1]} ${PRIMES[2]} ${PRIMES[3]} ${PRIMES[4]} ${PRIMES[5]} ${PRIMES[6]} ${PRIMES[7]} ${PRIMES[8]} ${PRIMES[9]}"
    echo -e "  Bottom 10 primes:  ${PRIMES[90]} ${PRIMES[91]} ${PRIMES[92]} ${PRIMES[93]} ${PRIMES[94]} ${PRIMES[95]} ${PRIMES[96]} ${PRIMES[97]} ${PRIMES[98]} ${PRIMES[99]}"

    # Store for summary
    eval "${LANG_NAME}_TOTAL=${TOTAL_TIME}"
    eval "${LANG_NAME}_TESTED=${TESTED}"
    eval "${LANG_NAME}_AVG=${AVG_TIME}"
    eval "${LANG_NAME}_TOP=${PRIMES[0]}"
    eval "${LANG_NAME}_BOT=${PRIMES[99]}"
}

# ─── Run Benchmarks ─────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}═══ Benchmark: Top ${PRIME_TARGET} primes below ${TARGET} (reverse order) ═══${NC}"

benchmark_lang "Go"   "$GO_BIN"
benchmark_lang "Rust" "$RUST_BIN"
if [[ "$HAVE_JAVA" == "true" ]]; then
    benchmark_lang "Java" "$JAVA_CMD"
fi

# ─── Summary Table ───────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}═══ Benchmark Summary ═══${NC}"
printf "  ${BOLD}%-8s  %12s  %14s  %12s  %12s  %12s${NC}\n" "Lang" "Total Time" "Nums Tested" "Avg/Num" "Top Prime" "100th Prime"
printf "  %-8s  %11ss  %14s  %11ss  %12s  %12s\n" "Go"   "${Go_TOTAL}"   "${Go_TESTED}"   "${Go_AVG}"   "${Go_TOP}"   "${Go_BOT}"
printf "  %-8s  %11ss  %14s  %11ss  %12s  %12s\n" "Rust" "${Rust_TOTAL}" "${Rust_TESTED}" "${Rust_AVG}" "${Rust_TOP}" "${Rust_BOT}"
if [[ "$HAVE_JAVA" == "true" ]]; then
    printf "  %-8s  %11ss  %14s  %11ss  %12s  %12s\n" "Java" "${Java_TOTAL}" "${Java_TESTED}" "${Java_AVG}" "${Java_TOP}" "${Java_BOT}"
fi

echo ""
echo -e "${GREEN}Benchmark complete.${NC}"
