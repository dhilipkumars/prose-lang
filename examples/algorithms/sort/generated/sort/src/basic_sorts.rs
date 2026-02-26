pub fn insertion<T: Ord>(arr: &mut [T]) {
    let length = arr.len();
    for i in 1..length {
        let mut iterator = i;
        while iterator > 0 && arr[iterator - 1] > arr[iterator] {
            arr.swap(iterator, iterator - 1);
            iterator -= 1;
        }
    }
}

pub fn selection<T: Ord>(arr: &mut [T]) {
    let length = arr.len();
    if length == 0 { return; }
    for i in 0..length - 1 {
        let mut min = i;
        for j in i + 1..length {
            if arr[j] < arr[min] {
                min = j;
            }
        }
        arr.swap(i, min);
    }
}

pub fn bubble<T: Ord>(arr: &mut [T]) {
    let length = arr.len();
    if length == 0 { return; }
    let mut swapped = true;
    while swapped {
        swapped = false;
        for i in 0..length - 1 {
            if arr[i + 1] < arr[i] {
                arr.swap(i + 1, i);
                swapped = true;
            }
        }
    }
}

pub fn exchange<T: Ord>(arr: &mut [T]) {
    let length = arr.len();
    if length == 0 { return; }
    for i in 0..length - 1 {
        for j in i + 1..length {
            if arr[i] > arr[j] {
                arr.swap(i, j);
            }
        }
    }
}

pub fn simple<T: Ord>(arr: &mut [T]) {
    let length = arr.len();
    if length == 0 { return; }
    for i in 0..length {
        for j in 0..length {
            if arr[i] < arr[j] {
                arr.swap(i, j);
            }
        }
    }
}

pub fn improved_simple<T: Ord>(arr: &mut [T]) {
    let length = arr.len();
    if length <= 1 { return; }
    for i in 1..length {
        for j in 0..length - 1 {
            if arr[i] < arr[j] {
                arr.swap(i, j);
            }
        }
    }
}

pub fn cocktail<T: Ord>(arr: &mut [T]) {
    let length = arr.len();
    if length == 0 { return; }
    let mut swapped = true;
    let mut start = 0;
    let mut end = length - 1;

    while swapped {
        swapped = false;
        let mut new_end = start;
        for i in start..end {
            if arr[i] > arr[i + 1] {
                arr.swap(i, i + 1);
                new_end = i;
                swapped = true;
            }
        }
        end = new_end;
        if !swapped { break; }
        
        swapped = false;
        let mut new_start = end;
        for i in (start + 1..=end).rev() {
            if arr[i] < arr[i - 1] {
                arr.swap(i, i - 1);
                new_start = i;
                swapped = true;
            }
        }
        start = new_start;
    }
}

pub fn comb<T: Ord>(arr: &mut [T]) {
    let length = arr.len();
    let mut gap = length;
    let mut swapped = true;

    while gap != 1 || swapped {
        gap = (gap * 10) / 13;
        if gap < 1 {
            gap = 1;
        }
        swapped = false;
        for i in 0..length.saturating_sub(gap) {
            if arr[i] > arr[i + gap] {
                arr.swap(i, i + gap);
                swapped = true;
            }
        }
    }
}

pub fn odd_even_sort<T: Ord>(arr: &mut [T]) {
    let length = arr.len();
    if length == 0 { return; }
    let mut swapped = true;

    while swapped {
        swapped = false;
        // Odd pass
        for i in (1..length.saturating_sub(1)).step_by(2) {
            if arr[i] > arr[i + 1] {
                arr.swap(i, i + 1);
                swapped = true;
            }
        }
        // Even pass
        for i in (0..length.saturating_sub(1)).step_by(2) {
            if arr[i] > arr[i + 1] {
                arr.swap(i, i + 1);
                swapped = true;
            }
        }
    }
}
