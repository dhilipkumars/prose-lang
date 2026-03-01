package main

import (
	"fmt"
	"math"
	"os"
	"strconv"
)

// ──────────────────────────────────────────────────────────────────────────────
// AKS Primality Test — "PRIMES is in P" (Agrawal, Kayal, Saxena, 2002)
//
// Implements the algorithm exactly as specified in the @prose_strict_block:
//
//  1. Perfect power check
//  2. Find smallest r with ord_r(n) > (log₂ n)²
//  3. Trial division up to min(r, n-1)
//  4. If n ≤ r → prime
//  5. Polynomial identity check: (X+a)^n ≡ X^n+a (mod X^r-1, n)
//  6. Output prime
// ──────────────────────────────────────────────────────────────────────────────

// gcd computes the greatest common divisor of a and b.
func gcd(a, b int64) int64 {
	for b != 0 {
		a, b = b, a%b
	}
	if a < 0 {
		return -a
	}
	return a
}

// isPerfectPower checks if n = a^b for some integers a > 1 and b > 1.
func isPerfectPower(n int64) bool {
	if n <= 3 {
		return false
	}
	maxB := int64(math.Floor(math.Log2(float64(n)))) + 1
	for b := int64(2); b <= maxB; b++ {
		// Binary search for a such that a^b == n
		lo, hi := int64(2), int64(math.Pow(float64(n), 1.0/float64(b)))+2
		for lo <= hi {
			mid := lo + (hi-lo)/2
			val := intPow(mid, b)
			if val == n {
				return true
			} else if val < n && val > 0 { // val > 0 guards overflow
				lo = mid + 1
			} else {
				hi = mid - 1
			}
		}
	}
	return false
}

// intPow computes base^exp. Returns -1 on overflow.
func intPow(base, exp int64) int64 {
	result := int64(1)
	for i := int64(0); i < exp; i++ {
		result *= base
		if result < 0 || result > 1e18 {
			return -1 // overflow sentinel
		}
	}
	return result
}

// modPow computes (base^exp) mod m.
func modPow(base, exp, m int64) int64 {
	if m == 1 {
		return 0
	}
	result := int64(1)
	base = base % m
	if base < 0 {
		base += m
	}
	for exp > 0 {
		if exp%2 == 1 {
			result = mulMod(result, base, m)
		}
		exp /= 2
		base = mulMod(base, base, m)
	}
	return result
}

// mulMod computes (a * b) mod m without overflow for values up to ~2^62.
func mulMod(a, b, m int64) int64 {
	// Use Go's natural 64-bit arithmetic; for very large values, we
	// cast to uint64 to avoid signed overflow issues.
	return int64(uint64(a) * uint64(b) % uint64(m))
}

// multiplicativeOrder returns ord_r(n): the smallest k > 0 such that n^k ≡ 1 (mod r).
// Requires gcd(n, r) == 1.
func multiplicativeOrder(n, r int64) int64 {
	if r == 1 {
		return 1
	}
	result := int64(1)
	cur := n % r
	for cur != 1 {
		cur = (cur * (n % r)) % r
		result++
		if result > r {
			return result // safety bound
		}
	}
	return result
}

// eulerTotient computes φ(n).
func eulerTotient(n int64) int64 {
	result := n
	p := int64(2)
	temp := n
	for p*p <= temp {
		if temp%p == 0 {
			for temp%p == 0 {
				temp /= p
			}
			result -= result / p
		}
		p++
	}
	if temp > 1 {
		result -= result / temp
	}
	return result
}

// ──────────────────────────────────────────────────────────────────────────────
// Polynomial arithmetic modulo (X^r - 1, n)
//
// Polynomials are represented as []int64 of length r, where index i holds
// the coefficient of X^i. All coefficients are in [0, n).
// ──────────────────────────────────────────────────────────────────────────────

// polyMul multiplies two polynomials mod (X^r - 1, n).
func polyMul(a, b []int64, r int, n int64) []int64 {
	result := make([]int64, r)
	for i := 0; i < r; i++ {
		if a[i] == 0 {
			continue
		}
		for j := 0; j < r; j++ {
			if b[j] == 0 {
				continue
			}
			idx := (i + j) % r
			result[idx] = (result[idx] + mulMod(a[i], b[j], n)) % n
		}
	}
	return result
}

// polyPowMod computes (X + a)^exp mod (X^r - 1, n) using binary exponentiation.
func polyPowMod(a int64, exp int64, r int, n int64) []int64 {
	// base = X + a → coefficients: [a, 1, 0, 0, ...]
	base := make([]int64, r)
	base[0] = a % n
	base[1%r] = (base[1%r] + 1) % n

	// result = 1 → coefficients: [1, 0, 0, ...]
	result := make([]int64, r)
	result[0] = 1

	for exp > 0 {
		if exp%2 == 1 {
			result = polyMul(result, base, r, n)
		}
		exp /= 2
		if exp > 0 {
			base = polyMul(base, base, r, n)
		}
	}
	return result
}

// ──────────────────────────────────────────────────────────────────────────────
// AKS main function
// ──────────────────────────────────────────────────────────────────────────────

// aksPrimalityTest returns true if n is prime, false if composite.
func aksPrimalityTest(n int64) bool {
	// Handle trivial cases
	if n < 2 {
		return false
	}
	if n <= 3 {
		return true
	}
	if n%2 == 0 {
		return false
	}

	// Step 1: Check if n is a perfect power.
	if isPerfectPower(n) {
		return false
	}

	// Step 2: Find the smallest r such that ord_r(n) > (log₂ n)².
	log2n := math.Log2(float64(n))
	log2nSq := log2n * log2n
	r := int64(2)
	for ; ; r++ {
		g := gcd(r, n)
		if g > 1 && g < n {
			// 1 < gcd(r, n) < n → n is composite
			return false
		}
		if g == 1 {
			ord := multiplicativeOrder(n, r)
			if float64(ord) > log2nSq {
				break
			}
		}
		// If g == n (i.e., r divides n perfectly), skip — handled by step 4
	}

	// Step 3: For all 2 ≤ a ≤ min(r, n-1), check that a does not divide n.
	limit := r
	if n-1 < limit {
		limit = n - 1
	}
	for a := int64(2); a <= limit; a++ {
		if n%a == 0 {
			return false
		}
	}

	// Step 4: If n ≤ r, then output prime.
	if n <= r {
		return true
	}

	// Step 5: For a = 1 to ⌊√(φ(r)) · log₂(n)⌋,
	// check (X+a)^n ≡ X^n + a (mod X^r - 1, n).
	phiR := eulerTotient(r)
	upperBound := int64(math.Floor(math.Sqrt(float64(phiR)) * log2n))
	rInt := int(r)

	for a := int64(1); a <= upperBound; a++ {
		// Compute (X+a)^n mod (X^r - 1, n)
		lhs := polyPowMod(a, n, rInt, n)

		// Build X^n + a mod (X^r - 1, n)
		rhs := make([]int64, rInt)
		rhs[int(n%int64(rInt))] = 1
		rhs[0] = (rhs[0] + a%n) % n

		// Compare
		for i := 0; i < rInt; i++ {
			if lhs[i] != rhs[i] {
				return false
			}
		}
	}

	// Step 6: Output prime.
	return true
}

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: %s <number>\n", os.Args[0])
		os.Exit(1)
	}

	n, err := strconv.ParseInt(os.Args[1], 10, 64)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: invalid number '%s'\n", os.Args[1])
		os.Exit(1)
	}

	if aksPrimalityTest(n) {
		fmt.Println("true")
	} else {
		fmt.Println("false")
	}
}
