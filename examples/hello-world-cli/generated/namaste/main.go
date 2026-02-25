package main

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: namaste <N>")
		return
	}

	n, err := strconv.Atoi(os.Args[1])
	if err != nil {
		fmt.Printf("Invalid number: %s\n", os.Args[1])
		return
	}

	for i := 0; i <= n; i++ {
		if i%2 != 0 {
			timestamp := time.Now().UTC().Format(time.RFC3339)
			fmt.Printf("Namaste World!, %s\n", timestamp)
		}
	}
}
