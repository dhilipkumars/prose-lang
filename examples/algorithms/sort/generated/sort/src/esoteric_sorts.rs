use rand::Rng;

fn is_sorted<T: Ord>(arr: &[T]) -> bool {
    let len = arr.len();
    if len <= 1 { return true; }
    for i in 0..len - 1 {
        if arr[i] > arr[i + 1] {
            return false;
        }
    }
    true
}

fn shuffle<T>(arr: &mut [T]) {
    let mut rng = rand::thread_rng();
    for i in 0..arr.len() {
        let j = rng.gen_range(0..=i);
        arr.swap(i, j);
    }
}

pub fn bogo<T: Ord>(arr: &mut [T]) {
    while !is_sorted(arr) {
        shuffle(arr);
    }
}

pub fn cycle<T: Ord + Clone>(arr: &mut [T]) {
    let len = arr.len();
    if len <= 1 { return; }
    for cycle in 0..len - 1 {
        let mut elem = arr[cycle].clone();
        let mut pos = cycle;
        for counter in cycle + 1..len {
            if arr[counter] < elem {
                pos += 1;
            }
        }
        if pos == cycle {
            continue;
        }
        while elem == arr[pos] {
            pos += 1;
        }
        std::mem::swap(&mut arr[pos], &mut elem);
        while pos != cycle {
            pos = cycle;
            for counter in cycle + 1..len {
                if arr[counter] < elem {
                    pos += 1;
                }
            }
            while elem == arr[pos] {
                pos += 1;
            }
            if elem != arr[pos] {
                std::mem::swap(&mut arr[pos], &mut elem);
            }
        }
    }
}

fn flip<T>(arr: &mut [T], mut i: usize) {
    let mut j = 0;
    while j < i {
        arr.swap(j, i);
        j += 1;
        i -= 1;
    }
}

pub fn pancake<T: Ord>(arr: &mut [T]) {
    let len = arr.len();
    if len <= 1 { return; }
    for i in (1..len).rev() {
        let mut max = 0;
        for j in 1..=i {
            if arr[j] > arr[max] {
                max = j;
            }
        }
        if max != i {
            flip(arr, max);
            flip(arr, i);
        }
    }
}

fn merge_piles<T: Ord + Clone>(mut piles: Vec<Vec<T>>) -> Vec<T> {
    let mut ret = Vec::new();
    while !piles.is_empty() {
        let mut min_id = 0;
        let mut min_value = piles[0].last().unwrap().clone();
        for i in 1..piles.len() {
            let last = piles[i].last().unwrap().clone();
            if min_value <= last {
                continue;
            }
            min_value = last;
            min_id = i;
        }
        ret.push(min_value);
        piles[min_id].pop();
        if piles[min_id].is_empty() {
            piles.remove(min_id);
        }
    }
    ret
}

pub fn patience<T: Ord + Clone>(arr: &mut [T]) {
    let len = arr.len();
    if len <= 1 { return; }
    let mut piles: Vec<Vec<T>> = Vec::new();
    for card in arr.iter() {
        let mut left = 0;
        let mut right = piles.len();
        while left < right {
            let mid = left + (right - left) / 2;
            if piles[mid].last().unwrap() >= card {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        if left == piles.len() {
            piles.push(vec![card.clone()]);
        } else {
            piles[left].push(card.clone());
        }
    }
    let sorted = merge_piles(piles);
    arr.clone_from_slice(&sorted);
}

fn do_sort<T: Ord>(arr: &mut [T], left: usize, right: usize) -> bool {
    if left == right { return false; }
    let mut swapped = false;
    let mut low = left;
    let mut high = right;
    while low < high {
        if arr[low] > arr[high] {
            arr.swap(low, high);
            swapped = true;
        }
        low += 1;
        high -= 1;
    }
    if low == high && low + 1 <= right && arr[low] > arr[low + 1] {
        arr.swap(low, low + 1);
        swapped = true;
    }
    let mid = left + (right - left) / 2;
    let left_half = do_sort(arr, left, mid);
    let right_half = do_sort(arr, mid + 1, right);
    swapped || left_half || right_half
}

pub fn circle<T: Ord>(arr: &mut [T]) {
    let len = arr.len();
    if len <= 1 { return; }
    while do_sort(arr, 0, len - 1) {}
}

fn inner_stooge<T: Ord>(arr: &mut [T], i: usize, j: usize) {
    if arr[i] > arr[j] {
        arr.swap(i, j);
    }
    if (j - i + 1) > 2 {
        let t = (j - i + 1) / 3;
        inner_stooge(arr, i, j - t);
        inner_stooge(arr, i + t, j);
        inner_stooge(arr, i, j - t);
    }
}

pub fn stooge<T: Ord>(arr: &mut [T]) {
    let len = arr.len();
    if len <= 1 { return; }
    inner_stooge(arr, 0, len - 1);
}
