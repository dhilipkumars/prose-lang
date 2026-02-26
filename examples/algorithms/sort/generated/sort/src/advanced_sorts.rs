use crate::basic_sorts::insertion;
use std::cmp::min;

fn partition<T: Ord>(arr: &mut [T], low: isize, high: isize) -> isize {
    let mut index = low - 1;
    for i in low..high {
        if arr[i as usize] <= arr[high as usize] {
            index += 1;
            arr.swap(index as usize, i as usize);
        }
    }
    arr.swap((index + 1) as usize, high as usize);
    index + 1
}

fn quicksort_range<T: Ord>(arr: &mut [T], low: isize, high: isize) {
    if low < high {
        let pivot = partition(arr, low, high);
        quicksort_range(arr, low, pivot - 1);
        quicksort_range(arr, pivot + 1, high);
    }
}

pub fn quicksort<T: Ord>(arr: &mut [T]) {
    let len = arr.len();
    if len <= 1 { return; }
    quicksort_range(arr, 0, (len - 1) as isize);
}

fn merge_arrays<T: Ord + Clone>(a: &[T], b: &[T]) -> Vec<T> {
    let mut r = Vec::with_capacity(a.len() + b.len());
    let mut i = 0;
    let mut j = 0;
    while i < a.len() && j < b.len() {
        if a[i] <= b[j] {
            r.push(a[i].clone());
            i += 1;
        } else {
            r.push(b[j].clone());
            j += 1;
        }
    }
    while i < a.len() {
        r.push(a[i].clone());
        i += 1;
    }
    while j < b.len() {
        r.push(b[j].clone());
        j += 1;
    }
    r
}

pub fn merge<T: Ord + Clone>(items: &mut [T]) {
    let len = items.len();
    if len < 2 { return; }
    let middle = len / 2;
    let mut left = items[..middle].to_vec();
    let mut right = items[middle..].to_vec();
    merge(&mut left);
    merge(&mut right);
    let merged = merge_arrays(&left, &right);
    items.clone_from_slice(&merged);
}

pub fn merge_iter<T: Ord + Clone>(items: &mut [T]) {
    let len = items.len();
    let mut step = 1;
    while step < len {
        let mut i = 0;
        while i + step < len {
            let right_bound = min(i + 2 * step, len);
            let left = items[i..i + step].to_vec();
            let right = items[i + step..right_bound].to_vec();
            let tmp = merge_arrays(&left, &right);
            items[i..right_bound].clone_from_slice(&tmp);
            i += 2 * step;
        }
        step *= 2;
    }
}

pub fn parallel_merge<T: Ord + Clone + Send>(items: &mut [T]) {
    let len = items.len();
    if len < 2 { return; }
    if len < 2048 {
        merge(items);
        return;
    }
    let middle = len / 2;
    let mut left = items[..middle].to_vec();
    let mut right = items[middle..].to_vec();

    std::thread::scope(|s| {
        s.spawn(|| {
            parallel_merge(&mut left);
        });
        parallel_merge(&mut right);
    });

    let merged = merge_arrays(&left, &right);
    items.clone_from_slice(&merged);
}

fn heapify_down<T: Ord>(slice: &mut [T], n: usize, i: usize) {
    let l = 2 * i + 1;
    let r = 2 * i + 2;
    let mut max = i;

    if l < n && slice[l] > slice[max] {
        max = l;
    }
    if r < n && slice[r] > slice[max] {
        max = r;
    }
    if max != i {
        slice.swap(i, max);
        heapify_down(slice, n, max);
    }
}

pub fn heap_sort<T: Ord>(slice: &mut [T]) {
    let n = slice.len();
    if n <= 1 { return; }
    for i in (0..n / 2).rev() {
        heapify_down(slice, n, i);
    }
    for i in (1..n).rev() {
        slice.swap(i, 0);
        heapify_down(slice, i, 0);
    }
}

pub fn shell<T: Ord>(arr: &mut [T]) {
    let len = arr.len();
    let mut d = len / 2;
    while d > 0 {
        for i in d..len {
            let mut j = i;
            while j >= d && arr[j - d] > arr[j] {
                arr.swap(j, j - d);
                j -= d;
            }
        }
        d /= 2;
    }
}

fn calculate_run_size(mut data_length: usize) -> usize {
    let mut remainder = 0;
    while data_length >= 8 {
        if data_length % 2 == 1 {
            remainder = 1;
        }
        data_length /= 2;
    }
    data_length + remainder
}

pub fn timsort<T: Ord + Clone>(data: &mut [T]) {
    let len = data.len();
    if len <= 1 { return; }
    let run_size = calculate_run_size(len);
    
    let mut lower = 0;
    while lower < len {
        let upper = min(lower + run_size, len);
        insertion(&mut data[lower..upper]);
        lower += run_size;
    }
    
    let mut size = run_size;
    while size < len {
        let mut lower_bound = 0;
        while lower_bound < len {
            let middle_bound = lower_bound + size - 1;
            if middle_bound >= len - 1 {
                break;
            }
            let upper_bound = min(lower_bound + 2 * size - 1, len - 1);
            let left = data[lower_bound..=middle_bound].to_vec();
            let right = data[middle_bound + 1..=upper_bound].to_vec();
            let merged = merge_arrays(&left, &right);
            data[lower_bound..=upper_bound].clone_from_slice(&merged);
            lower_bound += size * 2;
        }
        size *= 2;
    }
}
