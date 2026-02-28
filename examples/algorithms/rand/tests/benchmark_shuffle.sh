#!/usr/bin/env bash
#
# Benchmark script for Knuth Random Shuffle — Cross-Language Performance
#
# Per .prose spec (benchmark test case):
#   - RAND_SEED is NOT set (use current time)
#   - Input: 100,000 element array with random numbers
#   - Run: 1,000 times per language
#   - Report: avg time, std dev, avg memory usage, std dev
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GEN_DIR="$PROJECT_DIR/generated/knuth_random_shuffle"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ITERATIONS=1000
ARRAY_SIZE=100000

# ─── Build Phase ─────────────────────────────────────────────────────────────

echo -e "${YELLOW}═══ Building all implementations ═══${NC}"

echo "  Building Go..."
(cd "$GEN_DIR/go" && go build -o "$GEN_DIR/go/knuth_shuffle" .)
echo -e "  ${GREEN}Go built.${NC}"

echo "  Building Rust (release)..."
(cd "$GEN_DIR/rust" && cargo build --release --quiet 2>&1)
echo -e "  ${GREEN}Rust built.${NC}"

echo -e "  ${GREEN}Python needs no build.${NC}"

GO_BIN="$GEN_DIR/go/knuth_shuffle"
RUST_BIN="$GEN_DIR/rust/target/release/knuth_random_shuffle"
PY_SCRIPT="$GEN_DIR/python/knuth_random_shuffle.py"

# ─── Generate Input ──────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}═══ Generating ${ARRAY_SIZE}-element input array ═══${NC}"

# Generate a deterministic large array using awk (faster than seq+shuf for 100K)
INPUT=$(awk -v n="$ARRAY_SIZE" 'BEGIN{for(i=1;i<=n;i++){if(i>1)printf ",";printf "%d",int(rand()*1000000)};}')
echo -e "  ${GREEN}Input generated (${#INPUT} chars).${NC}"

# Unset RAND_SEED so each run uses current time (per spec)
unset RAND_SEED 2>/dev/null || true

# ─── Benchmark Function ─────────────────────────────────────────────────────

run_benchmark() {
    local LANG_NAME="$1"
    local CMD="$2"
    local ITERS="$3"

    echo ""
    echo -e "${CYAN}─── Benchmarking ${BOLD}${LANG_NAME}${NC}${CYAN} (${ITERS} iterations) ───${NC}"

    local TIMES=()
    local MEMS=()

    for i in $(seq 1 "$ITERS"); do
        if (( i % 100 == 0 )); then
            echo -ne "  Progress: ${i}/${ITERS}\r"
        fi

        # Use /usr/bin/time to capture wall time and max RSS
        # macOS /usr/bin/time -l gives max RSS in bytes
        local TIME_OUTPUT
        TIME_OUTPUT=$( { /usr/bin/time -l $CMD "$INPUT" > /dev/null; } 2>&1 )

        # Extract real time (seconds) — macOS format: "N.NN real"
        local REAL_TIME
        REAL_TIME=$(echo "$TIME_OUTPUT" | grep 'real' | awk '{print $1}')

        # Extract max resident set size (bytes on macOS)
        local MAX_RSS
        MAX_RSS=$(echo "$TIME_OUTPUT" | grep 'maximum resident set size' | awk '{print $1}')

        if [[ -n "$REAL_TIME" ]]; then
            TIMES+=("$REAL_TIME")
        fi
        if [[ -n "$MAX_RSS" ]]; then
            MEMS+=("$MAX_RSS")
        fi
    done
    echo -ne "  Progress: ${ITERS}/${ITERS}\n"

    # Calculate stats using awk
    local TIME_STATS
    TIME_STATS=$(printf '%s\n' "${TIMES[@]}" | awk '{
        sum += $1; sumsq += $1*$1; n++
    } END {
        avg = sum/n;
        variance = sumsq/n - avg*avg;
        if (variance < 0) variance = 0;
        stddev = sqrt(variance);
        printf "%.4f %.4f", avg, stddev
    }')

    local MEM_STATS
    MEM_STATS=$(printf '%s\n' "${MEMS[@]}" | awk '{
        sum += $1; sumsq += $1*$1; n++
    } END {
        avg = sum/n;
        variance = sumsq/n - avg*avg;
        if (variance < 0) variance = 0;
        stddev = sqrt(variance);
        printf "%.0f %.0f", avg/1024, stddev/1024
    }')

    local AVG_TIME=$(echo "$TIME_STATS" | awk '{print $1}')
    local STD_TIME=$(echo "$TIME_STATS" | awk '{print $2}')
    local AVG_MEM=$(echo "$MEM_STATS" | awk '{print $1}')
    local STD_MEM=$(echo "$MEM_STATS" | awk '{print $2}')

    echo -e "  ${GREEN}Avg Time:   ${AVG_TIME}s  (σ = ${STD_TIME}s)${NC}"
    echo -e "  ${GREEN}Avg Memory: ${AVG_MEM} KB  (σ = ${STD_MEM} KB)${NC}"

    # Store for summary
    eval "${LANG_NAME}_AVG_TIME=${AVG_TIME}"
    eval "${LANG_NAME}_STD_TIME=${STD_TIME}"
    eval "${LANG_NAME}_AVG_MEM=${AVG_MEM}"
    eval "${LANG_NAME}_STD_MEM=${STD_MEM}"
}

# ─── Run Benchmarks ─────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}═══ Benchmark: ${ARRAY_SIZE} elements × ${ITERATIONS} iterations ═══${NC}"
echo -e "  ${CYAN}RAND_SEED is NOT set (per spec)${NC}"

run_benchmark "Go"     "$GO_BIN"                      "$ITERATIONS"
run_benchmark "Rust"   "$RUST_BIN"                     "$ITERATIONS"
run_benchmark "Python" "python3 $PY_SCRIPT"            "$ITERATIONS"

# ─── Summary Table ───────────────────────────────────────────────────────────

echo ""
echo -e "${YELLOW}═══ Benchmark Summary ═══${NC}"
printf "  ${BOLD}%-8s  %12s  %12s  %12s  %12s${NC}\n" "Lang" "Avg Time" "σ Time" "Avg Mem" "σ Mem"
printf "  %-8s  %11ss  %11ss  %10s KB  %10s KB\n" "Go"     "$Go_AVG_TIME"     "$Go_STD_TIME"     "$Go_AVG_MEM"     "$Go_STD_MEM"
printf "  %-8s  %11ss  %11ss  %10s KB  %10s KB\n" "Rust"   "$Rust_AVG_TIME"   "$Rust_STD_TIME"   "$Rust_AVG_MEM"   "$Rust_STD_MEM"
printf "  %-8s  %11ss  %11ss  %10s KB  %10s KB\n" "Python" "$Python_AVG_TIME" "$Python_STD_TIME" "$Python_AVG_MEM" "$Python_STD_MEM"

echo ""
echo -e "${GREEN}Benchmark complete.${NC}"
