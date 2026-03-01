import java.util.Arrays;

/**
 * AKS Primality Test — "PRIMES is in P" (Agrawal, Kayal, Saxena, 2002)
 *
 * Implements the algorithm exactly as specified in the @prose_strict_block:
 *
 *  1. Perfect power check
 *  2. Find smallest r with ord_r(n) > (log₂ n)²
 *  3. Trial division up to min(r, n-1)
 *  4. If n ≤ r → prime
 *  5. Polynomial identity check: (X+a)^n ≡ X^n+a (mod X^r-1, n)
 *  6. Output prime
 */
public class AKSPrimalityTest {

    // ── GCD ──────────────────────────────────────────────────────────────────

    static long gcd(long a, long b) {
        while (b != 0) {
            long t = b;
            b = a % b;
            a = t;
        }
        return Math.abs(a);
    }

    // ── Perfect Power Check ─────────────────────────────────────────────────

    static boolean isPerfectPower(long n) {
        if (n <= 3) return false;
        int maxB = (int) Math.floor(Math.log(n) / Math.log(2)) + 1;
        for (int b = 2; b <= maxB; b++) {
            // Binary search for a such that a^b == n
            long lo = 2;
            long hi = (long) Math.pow(n, 1.0 / b) + 2;
            while (lo <= hi) {
                long mid = lo + (hi - lo) / 2;
                long val = checkedPow(mid, b);
                if (val == n) return true;
                else if (val > 0 && val < n) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return false;
    }

    static long checkedPow(long base, int exp) {
        long result = 1;
        for (int i = 0; i < exp; i++) {
            result *= base;
            if (result < 0 || result > (long) 1e18) return -1; // overflow
        }
        return result;
    }

    // ── Modular Arithmetic ──────────────────────────────────────────────────

    static long mulMod(long a, long b, long m) {
        // Use Math.floorMod to handle potential negative intermediate values
        return Math.floorMod(Math.multiplyHigh(a, b) % m * (Long.MIN_VALUE % m * 2 % m) % m
                + (a * b) % m, m);
    }

    // Safer mulMod using BigInteger-style approach for correctness
    static long safeMulMod(long a, long b, long m) {
        a = Math.floorMod(a, m);
        b = Math.floorMod(b, m);
        // For values where a*b might overflow long, use repeated addition
        // with binary method
        if (a <= Integer.MAX_VALUE && b <= Integer.MAX_VALUE) {
            return (a * b) % m;
        }
        long result = 0;
        a = a % m;
        while (b > 0) {
            if ((b & 1) == 1) {
                result = (result + a) % m;
            }
            a = (a * 2) % m;
            b >>= 1;
        }
        return result;
    }

    static long modPow(long base, long exp, long modulus) {
        if (modulus == 1) return 0;
        long result = 1;
        base = Math.floorMod(base, modulus);
        while (exp > 0) {
            if (exp % 2 == 1) {
                result = safeMulMod(result, base, modulus);
            }
            exp /= 2;
            base = safeMulMod(base, base, modulus);
        }
        return result;
    }

    // ── Multiplicative Order ────────────────────────────────────────────────

    static long multiplicativeOrder(long n, long r) {
        if (r == 1) return 1;
        long result = 1;
        long cur = n % r;
        while (cur != 1) {
            cur = safeMulMod(cur, n % r, r);
            result++;
            if (result > r) return result;
        }
        return result;
    }

    // ── Euler's Totient ─────────────────────────────────────────────────────

    static long eulerTotient(long n) {
        long result = n;
        long temp = n;
        long p = 2;
        while (p * p <= temp) {
            if (temp % p == 0) {
                while (temp % p == 0) temp /= p;
                result -= result / p;
            }
            p++;
        }
        if (temp > 1) {
            result -= result / temp;
        }
        return result;
    }

    // ── Polynomial Arithmetic mod (X^r - 1, n) ─────────────────────────────

    static long[] polyMul(long[] a, long[] b, int r, long n) {
        long[] result = new long[r];
        for (int i = 0; i < r; i++) {
            if (a[i] == 0) continue;
            for (int j = 0; j < r; j++) {
                if (b[j] == 0) continue;
                int idx = (i + j) % r;
                result[idx] = (result[idx] + safeMulMod(a[i], b[j], n)) % n;
            }
        }
        return result;
    }

    static long[] polyPowMod(long aVal, long exp, int r, long n) {
        // base = X + a → [a, 1, 0, 0, ...]
        long[] base = new long[r];
        base[0] = aVal % n;
        base[1 % r] = (base[1 % r] + 1) % n;

        // result = 1 → [1, 0, 0, ...]
        long[] result = new long[r];
        result[0] = 1;

        while (exp > 0) {
            if (exp % 2 == 1) {
                result = polyMul(result, base, r, n);
            }
            exp /= 2;
            if (exp > 0) {
                base = polyMul(base, base, r, n);
            }
        }
        return result;
    }

    // ── AKS Primality Test ──────────────────────────────────────────────────

    static boolean aksPrimalityTest(long n) {
        // Trivial cases
        if (n < 2) return false;
        if (n <= 3) return true;
        if (n % 2 == 0) return false;

        // Step 1: Check if n is a perfect power.
        if (isPerfectPower(n)) return false;

        // Step 2: Find the smallest r such that ord_r(n) > (log₂ n)².
        double log2n = Math.log(n) / Math.log(2);
        double log2nSq = log2n * log2n;
        long r = 2;
        while (true) {
            long g = gcd(r, n);
            if (g > 1 && g < n) return false; // composite
            if (g == 1) {
                long ord = multiplicativeOrder(n, r);
                if ((double) ord > log2nSq) break;
            }
            r++;
        }

        // Step 3: For all 2 ≤ a ≤ min(r, n-1), check that a does not divide n.
        long limit = Math.min(r, n - 1);
        for (long a = 2; a <= limit; a++) {
            if (n % a == 0) return false;
        }

        // Step 4: If n ≤ r, output prime.
        if (n <= r) return true;

        // Step 5: For a = 1 to ⌊√(φ(r)) · log₂(n)⌋,
        // check (X+a)^n ≡ X^n + a (mod X^r - 1, n).
        long phiR = eulerTotient(r);
        long upperBound = (long) Math.floor(Math.sqrt(phiR) * log2n);
        int rInt = (int) r;

        for (long a = 1; a <= upperBound; a++) {
            long[] lhs = polyPowMod(a, n, rInt, n);

            // Build X^n + a mod (X^r - 1, n)
            long[] rhs = new long[rInt];
            rhs[(int) (n % r)] = 1;
            rhs[0] = (rhs[0] + a % n) % n;

            if (!Arrays.equals(lhs, rhs)) return false;
        }

        // Step 6: Output prime.
        return true;
    }

    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Usage: java AKSPrimalityTest <number>");
            System.exit(1);
        }

        long n;
        try {
            n = Long.parseLong(args[0]);
        } catch (NumberFormatException e) {
            System.err.println("Error: invalid number '" + args[0] + "'");
            System.exit(1);
            return;
        }

        System.out.println(aksPrimalityTest(n) ? "true" : "false");
    }
}
