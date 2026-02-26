use crate::basic_sorts::insertion;

pub fn count(data: &mut [i32]) {
    if data.is_empty() { return; }
    let mut a_min = data[0];
    let mut a_max = data[0];
    for &x in data.iter() {
        if x < a_min { a_min = x; }
        if x > a_max { a_max = x; }
    }
    let range = (a_max - a_min + 1) as usize;
    let mut count = vec![0; range];
    for &x in data.iter() {
        count[(x - a_min) as usize] += 1;
    }
    let mut z = 0;
    for (i, &c) in count.iter().enumerate() {
        let mut current_c = c;
        while current_c > 0 {
            data[z] = (i as i32) + a_min;
            z += 1;
            current_c -= 1;
        }
    }
}

fn count_sort(arr: &mut [i32], exp: i32) -> Vec<i32> {
    let mut digits = vec![0; 10];
    let mut output = vec![0; arr.len()];
    for &item in arr.iter() {
        digits[((item / exp) % 10) as usize] += 1;
    }
    for i in 1..10 {
        digits[i] += digits[i - 1];
    }
    for i in (0..arr.len()).rev() {
        let digit_index = ((arr[i] / exp) % 10) as usize;
        output[digits[digit_index] - 1] = arr[i];
        digits[digit_index] -= 1;
    }
    output
}

fn unsigned_radix_sort(arr: &mut [i32]) {
    if arr.is_empty() { return; }
    let mut max_element = arr[0];
    for &x in arr.iter() {
        if x > max_element { max_element = x; }
    }
    let mut exp = 1;
    while max_element / exp > 0 {
        let sorted = count_sort(arr, exp);
        arr.copy_from_slice(&sorted);
        exp *= 10;
    }
}

pub fn radix_sort(arr: &mut [i32]) {
    if arr.len() < 1 { return; }
    let mut negatives = Vec::new();
    let mut non_negatives = Vec::new();
    for &item in arr.iter() {
        if item < 0 {
            negatives.push(-item);
        } else {
            non_negatives.push(item);
        }
    }
    unsigned_radix_sort(&mut negatives);
    negatives.reverse();
    for n in negatives.iter_mut() {
        *n *= -1;
    }
    unsigned_radix_sort(&mut non_negatives);
    let mut i = 0;
    for n in negatives {
        arr[i] = n;
        i += 1;
    }
    for n in non_negatives {
        arr[i] = n;
        i += 1;
    }
}

pub fn bucket(arr: &mut [f64]) {
    let len = arr.len();
    if len <= 1 { return; }
    let mut min = arr[0];
    let mut max = arr[0];
    for &v in arr.iter() {
        if v < min { min = v; }
        if v > max { max = v; }
    }
    if max == min { return; }
    
    let mut buckets: Vec<Vec<f64>> = vec![Vec::new(); len];
    for &v in arr.iter() {
        let mut bucket_index = (((v - min) / (max - min)) * ((len - 1) as f64)) as usize;
        if bucket_index >= len { bucket_index = len - 1; }
        buckets[bucket_index].push(v);
    }
    for b in buckets.iter_mut() {
        let blen = b.len();
        for k in 1..blen {
            let mut iterator = k;
            while iterator > 0 && b[iterator - 1] > b[iterator] {
                b.swap(iterator, iterator - 1);
                iterator -= 1;
            }
        }
    }
    let mut i = 0;
    for b in buckets {
        for v in b {
            arr[i] = v;
            i += 1;
        }
    }
}

pub fn pigeonhole(arr: &mut [i32]) {
    if arr.is_empty() { return; }
    let mut min = arr[0];
    let mut max = arr[0];
    for &v in arr.iter() {
        if v < min { min = v; }
        if v > max { max = v; }
    }
    let size = (max - min + 1) as usize;
    let mut holes = vec![0; size];
    for &element in arr.iter() {
        holes[(element - min) as usize] += 1;
    }
    let mut i = 0;
    for j in 0..size {
        while holes[j] > 0 {
            holes[j] -= 1;
            arr[i] = (j as i32) + min;
            i += 1;
        }
    }
}
