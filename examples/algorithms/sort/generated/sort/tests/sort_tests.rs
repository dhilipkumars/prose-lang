use sort::basic_sorts::*;
use sort::advanced_sorts::*;
use sort::distribution_sorts::*;
use sort::esoteric_sorts::*;

fn run_sort_test<F>(sort_fn: F)
where
    F: Fn(&mut [i32]),
{
    let tests = vec![
        ("Sorted Unsigned", vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10], vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        ("Reversed Unsigned", vec![10, 9, 8, 7, 6, 5, 4, 3, 2, 1], vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        ("Sorted Signed", vec![-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], vec![-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        ("Reversed Signed", vec![10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10], vec![-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        ("Reversed Signed #2 (Even)", vec![10, 9, 8, 7, 6, 5, 4, 3, 2, 1, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10], vec![-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        ("Random Order Signed", vec![-5, 7, 4, -2, 6, 5, 8, 3, 2, -7, -1, 0, -3, 9, -6, -4, 10, 9, 1, -8, -9, -10], vec![-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 10]),
        ("Empty Slice", vec![], vec![]),
        ("Singleton", vec![1], vec![1]),
    ];

    for (name, mut current, expected) in tests {
        sort_fn(&mut current);
        assert_eq!(current, expected, "Failed test case: {}", name);
    }
}

fn run_f64_sort_test<F>(sort_fn: F)
where
    F: Fn(&mut [f64]),
{
    let tests = vec![
        ("Sorted Unsigned", vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0], vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]),
        ("Reversed Unsigned", vec![10.0, 9.0, 8.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.0], vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]),
        ("Sorted Signed", vec![-10.0, -9.0, -8.0, -7.0, -6.0, -5.0, -4.0, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0], vec![-10.0, -9.0, -8.0, -7.0, -6.0, -5.0, -4.0, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]),
        ("Empty Slice", vec![], vec![]),
        ("Singleton", vec![1.0], vec![1.0]),
    ];

    for (name, mut current, expected) in tests {
        sort_fn(&mut current);
        assert_eq!(current, expected, "Failed test case: {}", name);
    }
}

// Basic Sorts
#[test] fn test_insertion() { run_sort_test(insertion); }
#[test] fn test_selection() { run_sort_test(selection); }
#[test] fn test_bubble() { run_sort_test(bubble); }
#[test] fn test_exchange() { run_sort_test(exchange); }
#[test] fn test_simple() { run_sort_test(simple); }
#[test] fn test_improved_simple() { run_sort_test(improved_simple); }
#[test] fn test_cocktail() { run_sort_test(cocktail); }
#[test] fn test_comb() { run_sort_test(comb); }
#[test] fn test_odd_even_sort() { run_sort_test(odd_even_sort); }

// Advanced Sorts
#[test] fn test_quicksort() { run_sort_test(quicksort); }
#[test] fn test_merge() { run_sort_test(merge); }
#[test] fn test_merge_iter() { run_sort_test(merge_iter); }
#[test] fn test_parallel_merge() { run_sort_test(parallel_merge); }
#[test] fn test_heap_sort() { run_sort_test(heap_sort); }
#[test] fn test_shell() { run_sort_test(shell); }
#[test] fn test_timsort() { run_sort_test(timsort); }

// Distribution Sorts
#[test] fn test_count() { run_sort_test(count); }
#[test] fn test_radix_sort() { run_sort_test(radix_sort); }
#[test] fn test_bucket() { run_f64_sort_test(bucket); }
#[test] fn test_pigeonhole() { run_sort_test(pigeonhole); }

// Esoteric Sorts
#[test] fn test_bogo() { 
    // Bogo sort takes too long randomly. Skipping or running on 5 elements max.
    let mut arr = vec![5, 4, 3, 2, 1];
    bogo(&mut arr);
    assert_eq!(arr, vec![1, 2, 3, 4, 5]);
}
#[test] fn test_cycle() { run_sort_test(cycle); }
#[test] fn test_pancake() { run_sort_test(pancake); }
#[test] fn test_patience() { run_sort_test(patience); }
#[test] fn test_circle() { run_sort_test(circle); }
#[test] fn test_stooge() { run_sort_test(stooge); }
