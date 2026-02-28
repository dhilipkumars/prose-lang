#!/usr/bin/env python3
"""
Knuth (Fisher-Yates) Random Shuffle

Uses a simple LCG (Linear Congruential Generator) with glibc constants
for cross-language deterministic parity with Go and Rust implementations.

LCG Parameters:
    a = 1103515245
    c = 12345
    m = 2^31 (2147483648)
"""

import os
import sys
import time

LCG_A = 1103515245
LCG_C = 12345
LCG_M = 2**31  # 2147483648

lcg_state = 0


def lcg_seed(seed: int) -> None:
    global lcg_state
    lcg_state = seed % LCG_M


def lcg_next() -> int:
    global lcg_state
    lcg_state = (LCG_A * lcg_state + LCG_C) % LCG_M
    return lcg_state


def lcg_intn(upper_bound: int) -> int:
    return lcg_next() % upper_bound


def knuth_random_shuffle(arr: list[int]) -> list[int]:
    """Perform a Fisher-Yates (Knuth) shuffle using the LCG-based PRNG."""
    n = len(arr)
    for i in range(n - 1, 0, -1):
        j = lcg_intn(i + 1)
        arr[i], arr[j] = arr[j], arr[i]
    return arr


def main() -> None:
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <comma-separated integers>", file=sys.stderr)
        sys.exit(1)

    # Parse RAND_SEED from environment
    seed_str = os.environ.get("RAND_SEED")
    if seed_str is not None:
        try:
            lcg_seed(int(seed_str))
        except ValueError:
            print(f"Error: invalid RAND_SEED value: {seed_str}", file=sys.stderr)
            sys.exit(1)
    else:
        lcg_seed(int(time.time()))

    # Parse comma-separated integers from command line
    try:
        arr = [int(x.strip()) for x in sys.argv[1].split(",")]
    except ValueError as e:
        print(f"Error: invalid integer in input: {e}", file=sys.stderr)
        sys.exit(1)

    result = knuth_random_shuffle(arr)

    # Output as comma-separated integers
    print(",".join(str(v) for v in result))


if __name__ == "__main__":
    main()
