//! Knuth (Fisher-Yates) Random Shuffle
//!
//! Uses a simple LCG (Linear Congruential Generator) with glibc constants
//! for cross-language deterministic parity with Go and Python implementations.
//!
//! LCG Parameters:
//!     a = 1103515245
//!     c = 12345
//!     m = 2^31 (2147483648)

use std::env;
use std::process;
use std::time::{SystemTime, UNIX_EPOCH};

const LCG_A: u64 = 1103515245;
const LCG_C: u64 = 12345;
const LCG_M: u64 = 1 << 31; // 2147483648

struct Lcg {
    state: u64,
}

impl Lcg {
    fn new(seed: u64) -> Self {
        Lcg {
            state: seed % LCG_M,
        }
    }

    fn next(&mut self) -> u64 {
        self.state = (LCG_A * self.state + LCG_C) % LCG_M;
        self.state
    }

    fn intn(&mut self, upper_bound: u64) -> usize {
        (self.next() % upper_bound) as usize
    }
}

/// Perform a Fisher-Yates (Knuth) shuffle using the LCG-based PRNG.
fn knuth_random_shuffle(arr: &mut [i64], rng: &mut Lcg) {
    let n = arr.len();
    for i in (1..n).rev() {
        let j = rng.intn((i + 1) as u64);
        arr.swap(i, j);
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: {} <comma-separated integers>", args[0]);
        process::exit(1);
    }

    // Parse RAND_SEED from environment
    let mut rng = match env::var("RAND_SEED") {
        Ok(seed_str) => match seed_str.parse::<u64>() {
            Ok(seed) => Lcg::new(seed),
            Err(_) => {
                eprintln!("Error: invalid RAND_SEED value: {}", seed_str);
                process::exit(1);
            }
        },
        Err(_) => {
            let secs = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs();
            Lcg::new(secs)
        }
    };

    // Parse comma-separated integers from command line
    let mut arr: Vec<i64> = args[1]
        .split(',')
        .map(|s| {
            s.trim().parse::<i64>().unwrap_or_else(|_| {
                eprintln!("Error: invalid integer '{}'", s.trim());
                process::exit(1);
            })
        })
        .collect();

    knuth_random_shuffle(&mut arr, &mut rng);

    // Output as comma-separated integers
    let output: Vec<String> = arr.iter().map(|v| v.to_string()).collect();
    println!("{}", output.join(","));
}
