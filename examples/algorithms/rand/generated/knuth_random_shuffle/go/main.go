package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// LCG implements a Linear Congruential Generator using glibc constants
// for cross-language deterministic parity.
//
//	a = 1103515245
//	c = 12345
//	m = 2^31 (2147483648)
const (
	lcgA = 1103515245
	lcgC = 12345
	lcgM = 1 << 31 // 2147483648
)

var lcgState uint64

func lcgSeed(seed uint64) {
	lcgState = seed % lcgM
}

func lcgNext() uint64 {
	lcgState = (lcgA*lcgState + lcgC) % lcgM
	return lcgState
}

func lcgIntn(upperBound int) int {
	return int(lcgNext() % uint64(upperBound))
}

// KnuthRandomShuffle performs a Fisher-Yates (Knuth) shuffle on the slice
// using the LCG-based PRNG for deterministic cross-language parity.
func KnuthRandomShuffle(arr []int) []int {
	n := len(arr)
	for i := n - 1; i >= 1; i-- {
		j := lcgIntn(i + 1)
		arr[i], arr[j] = arr[j], arr[i]
	}
	return arr
}

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: %s <comma-separated integers>\n", os.Args[0])
		os.Exit(1)
	}

	// Parse RAND_SEED from environment
	if seedStr, ok := os.LookupEnv("RAND_SEED"); ok {
		seed, err := strconv.ParseUint(seedStr, 10, 64)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: invalid RAND_SEED value: %s\n", seedStr)
			os.Exit(1)
		}
		lcgSeed(seed)
	} else {
		lcgSeed(uint64(time.Now().Unix()))
	}

	// Parse comma-separated integers from command line
	parts := strings.Split(os.Args[1], ",")
	arr := make([]int, len(parts))
	for i, p := range parts {
		val, err := strconv.Atoi(strings.TrimSpace(p))
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: invalid integer '%s'\n", p)
			os.Exit(1)
		}
		arr[i] = val
	}

	result := KnuthRandomShuffle(arr)

	// Output as comma-separated integers
	strs := make([]string, len(result))
	for i, v := range result {
		strs[i] = strconv.Itoa(v)
	}
	fmt.Println(strings.Join(strs, ","))
}
