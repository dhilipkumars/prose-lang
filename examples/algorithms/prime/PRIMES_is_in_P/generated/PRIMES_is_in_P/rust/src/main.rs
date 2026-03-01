//! AKS Primality Test — "PRIMES is in P" (Agrawal, Kayal, Saxena, 2002)
//!
//! Implements the algorithm exactly as specified in the @prose_strict_block:
//!
//!  1. Perfect power check
//!  2. Find smallest r with ord_r(n) > (log₂ n)²
//!  3. Trial division up to min(r, n-1)
//!  4. If n ≤ r → prime
//!  5. Polynomial identity check: (X+a)^n ≡ X^n+a (mod X^r-1, n)
//!  6. Output prime

use std::env;
use std::process;

// ── GCD ──────────────────────────────────────────────────────────────────────

fn gcd(mut a: u64, mut b: u64) -> u64 {
    while b != 0 {
        let t = b;
        b = a % b;
        a = t;
    }
    a
}

// ── Perfect Power Check ─────────────────────────────────────────────────────

fn is_perfect_power(n: u64) -> bool {
    if n <= 3 {
        return false;
    }
    let max_b = (n as f64).log2().floor() as u32 + 1;
    for b in 2..=max_b {
        // Binary search for a such that a^b == n
        let mut lo: u64 = 2;
        let mut hi: u64 = (n as f64).powf(1.0 / b as f64) as u64 + 2;
        while lo <= hi {
            let mid = lo + (hi - lo) / 2;
            match checked_pow(mid, b) {
                Some(val) if val == n => return true,
                Some(val) if val < n => lo = mid + 1,
                _ => {
                    if mid == 0 {
                        break;
                    }
                    hi = mid - 1;
                }
            }
        }
    }
    false
}

fn checked_pow(base: u64, exp: u32) -> Option<u64> {
    let mut result: u64 = 1;
    for _ in 0..exp {
        result = result.checked_mul(base)?;
    }
    Some(result)
}

// ── Modular Arithmetic ──────────────────────────────────────────────────────

fn mod_pow(mut base: u64, mut exp: u64, modulus: u64) -> u64 {
    if modulus == 1 {
        return 0;
    }
    let mut result: u64 = 1;
    base %= modulus;
    while exp > 0 {
        if exp % 2 == 1 {
            result = mul_mod(result, base, modulus);
        }
        exp /= 2;
        base = mul_mod(base, base, modulus);
    }
    result
}

fn mul_mod(a: u64, b: u64, m: u64) -> u64 {
    ((a as u128 * b as u128) % m as u128) as u64
}

// ── Multiplicative Order ────────────────────────────────────────────────────

fn multiplicative_order(n: u64, r: u64) -> u64 {
    if r == 1 {
        return 1;
    }
    let mut result: u64 = 1;
    let mut cur = n % r;
    while cur != 1 {
        cur = mul_mod(cur, n % r, r);
        result += 1;
        if result > r {
            return result;
        }
    }
    result
}

// ── Euler's Totient ─────────────────────────────────────────────────────────

fn euler_totient(n: u64) -> u64 {
    let mut result = n;
    let mut temp = n;
    let mut p: u64 = 2;
    while p * p <= temp {
        if temp % p == 0 {
            while temp % p == 0 {
                temp /= p;
            }
            result -= result / p;
        }
        p += 1;
    }
    if temp > 1 {
        result -= result / temp;
    }
    result
}

// ── Polynomial Arithmetic mod (X^r - 1, n) ─────────────────────────────────
//
// Polynomials represented as Vec<u64> of length r.
// Index i = coefficient of X^i, all in [0, n).

fn poly_mul(a: &[u64], b: &[u64], r: usize, n: u64) -> Vec<u64> {
    let mut result = vec![0u64; r];
    for i in 0..r {
        if a[i] == 0 {
            continue;
        }
        for j in 0..r {
            if b[j] == 0 {
                continue;
            }
            let idx = (i + j) % r;
            result[idx] = (result[idx] + mul_mod(a[i], b[j], n)) % n;
        }
    }
    result
}

fn poly_pow_mod(a_val: u64, mut exp: u64, r: usize, n: u64) -> Vec<u64> {
    // base = X + a → [a, 1, 0, 0, ...]
    let mut base = vec![0u64; r];
    base[0] = a_val % n;
    base[1 % r] = (base[1 % r] + 1) % n;

    // result = 1 → [1, 0, 0, ...]
    let mut result = vec![0u64; r];
    result[0] = 1;

    while exp > 0 {
        if exp % 2 == 1 {
            result = poly_mul(&result, &base, r, n);
        }
        exp /= 2;
        if exp > 0 {
            base = poly_mul(&base, &base, r, n);
        }
    }
    result
}

// ── AKS Primality Test ──────────────────────────────────────────────────────

fn aks_primality_test(n: u64) -> bool {
    // Trivial cases
    if n < 2 {
        return false;
    }
    if n <= 3 {
        return true;
    }
    if n % 2 == 0 {
        return false;
    }

    // Step 1: Check if n is a perfect power.
    if is_perfect_power(n) {
        return false;
    }

    // Step 2: Find the smallest r such that ord_r(n) > (log₂ n)².
    let log2n = (n as f64).log2();
    let log2n_sq = log2n * log2n;
    let mut r: u64 = 2;
    loop {
        let g = gcd(r, n);
        if g > 1 && g < n {
            return false; // 1 < gcd(r, n) < n → composite
        }
        if g == 1 {
            let ord = multiplicative_order(n, r);
            if ord as f64 > log2n_sq {
                break;
            }
        }
        r += 1;
    }

    // Step 3: For all 2 ≤ a ≤ min(r, n-1), check that a does not divide n.
    let limit = r.min(n - 1);
    for a in 2..=limit {
        if n % a == 0 {
            return false;
        }
    }

    // Step 4: If n ≤ r, output prime.
    if n <= r {
        return true;
    }

    // Step 5: For a = 1 to ⌊√(φ(r)) · log₂(n)⌋,
    // check (X+a)^n ≡ X^n + a (mod X^r - 1, n).
    let phi_r = euler_totient(r);
    let upper_bound = ((phi_r as f64).sqrt() * log2n).floor() as u64;
    let r_usize = r as usize;

    for a in 1..=upper_bound {
        let lhs = poly_pow_mod(a, n, r_usize, n);

        // Build X^n + a mod (X^r - 1, n)
        let mut rhs = vec![0u64; r_usize];
        rhs[(n % r) as usize] = 1;
        rhs[0] = (rhs[0] + a % n) % n;

        if lhs != rhs {
            return false;
        }
    }

    // Step 6: Output prime.
    true
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: {} <number>", args[0]);
        process::exit(1);
    }

    let n: u64 = match args[1].parse() {
        Ok(v) => v,
        Err(_) => {
            eprintln!("Error: invalid number '{}'", args[1]);
            process::exit(1);
        }
    };

    if aks_primality_test(n) {
        println!("true");
    } else {
        println!("false");
    }
}
